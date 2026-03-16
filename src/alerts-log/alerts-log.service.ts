import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertLog } from './alerts-log.entity';
import { AlertThreshold } from './alert-threshold.entity';
import { CreateThresholdDto } from './dto/create-threshold.dto';
import { Measurement } from '../measurements/measurement.entity';
import { User } from '../users/user.entity';
import { UserFavorite } from '../user-favorites/user-favorite.entity';

@Injectable()
export class AlertsLogService {
  private readonly logger = new Logger(AlertsLogService.name);

  constructor(
    @InjectRepository(AlertLog)
    private alertLogRepository: Repository<AlertLog>,
    @InjectRepository(AlertThreshold)
    private thresholdRepository: Repository<AlertThreshold>,
  ) {}

  // 1. Gestión de Umbrales (Para el Panel Admin)
  async createThreshold(dto: CreateThresholdDto) {
    const newThreshold = this.thresholdRepository.create(dto);
    return await this.thresholdRepository.save(newThreshold);
  }

  async getAllThresholds() {
    return await this.thresholdRepository.find();
  }

  // 2. MOTOR DE ALERTAS (Lógica de Negocio)
  async checkAndCreateAlerts(measurement: Measurement) {
    this.logger.log(`Comprobando alertas para la estación: ${measurement.station.name} (AQI: ${measurement.aqi})`);

    // Buscamos usuarios que tengan esta estación en sus favoritos
    // Usamos el QueryBuilder para cruzar User -> HealthProfile -> UserFavorite en una sola consulta
    const usersWithFavorite = await this.alertLogRepository.manager
      .createQueryBuilder(User, 'user')
      .leftJoinAndSelect('user.healthProfile', 'healthProfile')
      .innerJoin(UserFavorite, 'fav', 'fav.userId = user.id')
      .where('fav.stationId = :stationId', { stationId: measurement.station.id })
      .getMany();

    for (const user of usersWithFavorite) {
      // Si el usuario no tiene perfil de salud completo, saltamos
      if (!user.healthProfile) continue;

      // Buscamos la regla (threshold) que coincida con su condición y sensibilidad
      const threshold = await this.thresholdRepository.findOne({
        where: {
          condition: user.healthProfile.condition,
          sensitivity: user.healthProfile.sensitivityLevel,
        },
      });

      // Si existe una regla y el AQI actual es mayor o igual al mínimo configurado...
      if (threshold && measurement.aqi >= threshold.min_aqi) {
        this.logger.warn(`¡Alerta detectada para el usuario ${user.email}!`);

        // Creamos el registro en el historial de alertas (AlertLog)
        const newAlert = this.alertLogRepository.create({
          message: `${threshold.message_template} [AQI: ${measurement.aqi} en ${measurement.station.name}]`,
          user: user,
          measurement: measurement,
        });

        await this.alertLogRepository.save(newAlert);
      }
    }
  }
}