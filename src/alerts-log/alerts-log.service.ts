import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertLog } from './alerts-log.entity';
import { AlertThreshold } from './alert-threshold.entity';
import { CreateThresholdDto } from './dto/create-threshold.dto';
import { Measurement } from '../measurements/measurement.entity';
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

  async createThreshold(dto: CreateThresholdDto) {
    const newThreshold = this.thresholdRepository.create(dto);
    return await this.thresholdRepository.save(newThreshold);
  }

  async getAllThresholds() {
  return await this.thresholdRepository.find({
    order: {
      id: 'ASC', // ASC = Ascendente (1, 2, 3...)
    },
  });
}

  async updateThreshold(id: number, data: Partial<AlertThreshold>) {
    await this.thresholdRepository.update(id, data);
    return await this.thresholdRepository.findOneBy({ id });
  }

  async findByUserId(userId: number) {
    return await this.alertLogRepository.find({
      where: { user: { id: userId } },
      order: { sent_at: 'DESC' },
    });
  }

  async countByUserId(userId: number): Promise<number> {
    return await this.alertLogRepository.count({
      where: { user: { id: userId }, is_read: false },
    });
  }

  async markAsRead(userId: number) {
    await this.alertLogRepository.update(
      { user: { id: userId }, is_read: false },
      { is_read: true },
    );
    return { success: true };
  }

  async remove(id: number) {
    return await this.alertLogRepository.delete(id);
  }

  async clearAll(userId: number) {
    return await this.alertLogRepository.delete({ user: { id: userId } });
  }

  async checkAndCreateAlerts(measurement: Measurement) {
    const stationName = measurement.station?.name || 'Estación desconocida';
    const stationFavorites = await this.alertLogRepository.manager
      .createQueryBuilder(UserFavorite, 'fav')
      .leftJoinAndSelect('fav.user', 'user')
      .leftJoinAndSelect('user.healthProfile', 'hp')
      .where('fav.stationId = :stationId', {
        stationId: measurement.station?.id || (measurement as any).stationId,
      })
      .getMany();

    if (stationFavorites.length === 0) return;

    for (const fav of stationFavorites) {
      const user = fav.user;
      if (!user || !user.healthProfile) continue;

      const threshold = await this.thresholdRepository.findOne({
        where: {
          condition: user.healthProfile.condition,
          sensitivity: user.healthProfile.sensitivityLevel,
        },
      });

      if (threshold && measurement.aqi >= threshold.min_aqi) {
        const alertMessage = `[Alerta en ${fav.alias || stationName}] ${threshold.message_template} (Nivel AQI: ${measurement.aqi})`;
        const newAlert = this.alertLogRepository.create({
          message: alertMessage,
          user: user,
          measurement: measurement,
          is_read: false,
        });
        await this.alertLogRepository.save(newAlert);
        this.logger.warn(`Alerta guardada para ${user.email}`);
      }
    }
  }
}