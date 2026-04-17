import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron'; 
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
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  // --- HISTORY METHODS ---

  async getStationHistory(stationId: number, limit: number) {
    return await this.measurementsRepository.find({
      where: { station: { id: stationId } },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  // --- SYNCHRONIZATION METHODS ---

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
    return await this.processWaqiData(response.data.data, false);
  }

  async syncStationData(city: string, isCron: boolean = false) {
    const token = this.configService.get<string>('WAQI_TOKEN');
    const url = `https://api.waqi.info/feed/${city}/?token=${token}`;
    const response = await lastValueFrom(this.httpService.get(url));
    return await this.processWaqiData(response.data.data, isCron);
  }

  private async processWaqiData(data: any, isCron: boolean = false) {
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

    // --- DATA ERROR FIX ---
    // We check whether the AQI is a valid number. If it is "-" or not numeric, we discard it
    const rawAqi = data.aqi;
    if (rawAqi === '-' || rawAqi === null || rawAqi === undefined || isNaN(Number(rawAqi))) {
      this.logger.warn(`[SYNC] Estación ${station.name} devolvió un AQI inválido ("${rawAqi}"). No se guardará esta medición.`);
      return null; 
    }

    const newAqi = Number(rawAqi);
    const newPm25 = data.iaqi?.pm25?.v || 0;
    const newNo2 = data.iaqi?.no2?.v || 0;

    const lastM = await this.measurementsRepository.findOne({
        where: { station: { id: station.id } },
        order: { timestamp: 'DESC' },
    });

    if (lastM && !isCron && lastM.aqi === newAqi && lastM.pm25 === newPm25 && lastM.no2 === newNo2) {
      this.logger.log(`[MANUAL] Datos idénticos para ${station.name}. No se guarda duplicado.`);
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
    
    if (isCron) {
      this.logger.log(`[CRON] Historial guardado para ${station.name} (AQI: ${newAqi})`);
    }

    await this.alertsLogService.checkAndCreateAlerts(savedMeasurement);
    return savedMeasurement;
  }

  // --- CRON JOBS ---

  @Cron(CronExpression.EVERY_HOUR, { name: 'sync-favorites' })
  async handleHourlySync() {
    this.logger.log('--- INICIANDO SINCRONIZACIÓN DE FAVORITOS ---');
    try {
      const activeStations = await this.stationsRepository
        .createQueryBuilder('station')
        .innerJoin('station.userFavorites', 'favorite')
        .getMany();

      for (const st of activeStations) {
        await this.syncStationData(`@${st.external_id}`, true);
      }
      this.logger.log('--- SINCRONIZACIÓN FINALIZADA ---');
    } catch (error) {
      this.logger.error('Error en Cron Job:', error);
    }
  }

  // --- OTHER METHODS ---

  updateCronFrequency(minutes: number) {
    const jobName = 'sync-favorites';
    try {
      const oldJob = this.schedulerRegistry.getCronJob(jobName);
      oldJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    } catch (e) {
      this.logger.warn('No había un Cron Job previo para borrar.');
    }

    const pattern = minutes === 1 ? '0 * * * * *' : '0 0 * * * *';
    this.currentFrequency = minutes === 1 ? '1 minuto' : '1 hora';

    const job = new CronJob(pattern, () => {
      this.handleHourlySync();
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(`Cron Job actualizado a: ${this.currentFrequency}`);
    return { frequency: this.currentFrequency };
  }

  async findAll(): Promise<Station[]> {
    return await this.stationsRepository.find({ 
      relations: ['measurements'],
      order: {
        measurements: {
          timestamp: 'DESC'
        }
      }
    });
  }

  getCronStatus() {
    return { frequency: this.currentFrequency };
  }
}