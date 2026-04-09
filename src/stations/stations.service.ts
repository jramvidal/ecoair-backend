import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron'; // Necesario para crear jobs dinámicos
import { lastValueFrom } from 'rxjs';
import { Station } from './station.entity';
import { Measurement } from '../measurements/measurement.entity';
import { AlertsLogService } from '../alerts-log/alerts-log.service';

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);
  private currentFrequency = '1 hora';

  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(Measurement)
    private measurementsRepository: Repository<Measurement>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly alertsLogService: AlertsLogService,
    private schedulerRegistry: SchedulerRegistry, // Inyectado para control dinámico
  ) {}

  // ADMIN METHOD: Update frequency.
  updateCronFrequency(minutes: number) {
    const jobName = 'sync-favorites';
    
    // 1. Stop and delete the previous job if it exists.
    try {
      const oldJob = this.schedulerRegistry.getCronJob(jobName);
      oldJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    } catch (e) {
      this.logger.warn('No había un Cron Job previo para borrar.');
    }

    // 2. Create the new cron pattern (0 */minutes * * * *)
    const pattern = minutes === 1 ? '0 * * * * *' : '0 0 * * * *';
    this.currentFrequency = minutes === 1 ? '1 minuto' : '1 hora';

    const job = new CronJob(pattern, () => {
      this.handleHourlySync();
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    this.logger.log(`Cron Job actualizado a frecuencia: ${this.currentFrequency}`);
    return { frequency: this.currentFrequency };
  }

  getCronStatus() {
    return { frequency: this.currentFrequency };
  }

  async findAll(): Promise<Station[]> {
    return await this.stationsRepository.find({ relations: ['measurements'] });
  }

  async syncByBounds(lat1: number, lon1: number, lat2: number, lon2: number) {
    const token = this.configService.get<string>('WAQI_TOKEN');
    const url = `https://api.waqi.info/map/bounds/?latlng=${lat1},${lon1},${lat2},${lon2}&token=${token}`;
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      const stationsData = response.data.data;
      if (response.data.status !== 'ok' || !Array.isArray(stationsData)) return [];
      
      const topStations = stationsData.slice(0, 10); 
      for (const data of topStations) {
        let station = await this.stationsRepository.findOne({
          where: { external_id: data.uid.toString() },
          relations: ['measurements']
        });
        
        if (!station) {
          station = this.stationsRepository.create({
            external_id: data.uid.toString(),
            name: data.station.name,
            lat: data.lat,
            lon: data.lon,
          });
          await this.stationsRepository.save(station);
          await this.syncStationData(`@${station.external_id}`);
        } else {
          const lastM = station.measurements?.[station.measurements.length - 1];
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (!lastM || lastM.timestamp < oneHourAgo) {
            await this.syncStationData(`@${station.external_id}`);
          }
        }
      }
      return await this.findAll();
    } catch (error) {
      return [];
    }
  }

  async syncByCoords(lat: number, lon: number) {
    const token = this.configService.get<string>('WAQI_TOKEN');
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
    const response = await lastValueFrom(this.httpService.get(url));
    return await this.processWaqiData(response.data.data);
  }

  async syncStationData(city: string) {
    const token = this.configService.get<string>('WAQI_TOKEN');
    const url = `https://api.waqi.info/feed/${city}/?token=${token}`;
    const response = await lastValueFrom(this.httpService.get(url));
    return await this.processWaqiData(response.data.data);
  }

  private async processWaqiData(data: any) {
    let station = await this.stationsRepository.findOne({
      where: { external_id: data.idx.toString() },
      relations: ['measurements']
    });

    if (!station) {
      station = this.stationsRepository.create({
        external_id: data.idx.toString(),
        name: data.city.name,
        lat: data.city.geo[0],
        lon: data.city.geo[1],
      });
      station = await this.stationsRepository.save(station);
    }

    const newAqi = data.aqi;
    const newPm25 = data.iaqi.pm25?.v || 0;
    const newNo2 = data.iaqi.no2?.v || 0;

    const lastM = await this.measurementsRepository.findOne({
        where: { station: { id: station.id } },
        order: { timestamp: 'DESC' },
        relations: ['station']
    });

    if (lastM && lastM.aqi === newAqi && lastM.pm25 === newPm25 && lastM.no2 === newNo2) {
      this.logger.log(`Datos idénticos para ${station.name}. Comprobando alertas...`);
      await this.alertsLogService.checkAndCreateAlerts(lastM);
      return lastM;
    }

    const measurement = this.measurementsRepository.create({
      aqi: newAqi,
      pm25: newPm25,
      no2: newNo2,
      station: station,
    });

    const savedMeasurement = await this.measurementsRepository.save(measurement);
    await this.alertsLogService.checkAndCreateAlerts(savedMeasurement);
    return savedMeasurement;
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'sync-favorites' }) // Assign a name to the job.
  async handleHourlySync() {
    this.logger.log('--- INICIANDO SINCRONIZACIÓN DE FAVORITOS ---');
    try {
      const activeStations = await this.stationsRepository
        .createQueryBuilder('station')
        .innerJoin('station.userFavorites', 'favorite')
        .getMany();

      for (const st of activeStations) {
        await this.syncStationData(`@${st.external_id}`);
      }
      this.logger.log('--- SINCRONIZACIÓN FINALIZADA ---');
    } catch (error) {
      this.logger.error('Error en Cron Job:', error);
    }
  }
}