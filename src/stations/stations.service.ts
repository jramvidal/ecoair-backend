import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { Station } from './station.entity';
import { Measurement } from '../measurements/measurement.entity';
import { AlertsLogService } from '../alerts-log/alerts-log.service'; // Importamos el servicio de alertas

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(Measurement)
    private measurementsRepository: Repository<Measurement>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly alertsLogService: AlertsLogService, // Inyectamos el motor de alertas
  ) {}

  // Tarea programada: Sincronización automática
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Iniciando sincronización automática de calidad del aire...');

    const cities = ['barcelona', 'madrid', 'valencia'];

    for (const city of cities) {
      try {
        await this.syncStatonData(city);
        this.logger.log(`Datos sincronizados y procesados correctamente para: ${city}`);
      } catch (error) {
        this.logger.error(`Error sincronizando ${city}: ${error.message}`);
      }
    }
  }

  async syncStatonData(city: string) {
    const token = this.configService.get<string>('WAQI_TOKEN');
    const url = `https://api.waqi.info/feed/${city}/?token=${token}`;

    const response = await lastValueFrom(this.httpService.get(url));
    const data = response.data.data;

    if (response.data.status !== 'ok') {
      throw new Error(`Ciudad no encontrada o error en API: ${city}`);
    }

    // 1. Lógica de Estación (Buscar o Crear)
    let station = await this.stationsRepository.findOne({
      where: { external_id: data.idx.toString() },
    });

    if (!station) {
      station = this.stationsRepository.create({
        external_id: data.idx.toString(),
        name: data.city.name,
        lat: data.city.geo[0],
        lon: data.city.geo[1],
      });
      await this.stationsRepository.save(station);
    }

    // 2. Lógica de Medición
    const measurement = this.measurementsRepository.create({
      aqi: data.aqi,
      pm25: data.iaqi.pm25?.v || 0,
      no2: data.iaqi.no2?.v || 0,
      station: station,
    });

    const savedMeasurement = await this.measurementsRepository.save(measurement);

    // 3. ¡CONEXIÓN AL MOTOR DE ALERTAS!
    // Enviamos la medición recién guardada para que se cruce con usuarios y umbrales
    await this.alertsLogService.checkAndCreateAlerts(savedMeasurement);

    return savedMeasurement;
  }
}