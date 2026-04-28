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
        condition: 'ASC',   // Alphabetical order by pathology
        sensitivity: 'ASC', // Second criteria: by sensitivity level
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
    // Counts all alerts that the user has not yet marked as read
    return await this.alertLogRepository.count({
      where: { user: { id: userId }, is_read: false },
    });
  }

  async markAsRead(userId: number) {
    // Updates the status of ALL pending alerts for the user to "read"
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
    // 1. SAFELY EXTRACT STATION ID
    // TypeORM sometimes doesn't load the 'station' relation after a save operation.
    // We check both the object property and the raw ID to avoid identifying errors.
    const stationId = measurement.station?.id || (measurement as any).stationId;
    const stationName = measurement.station?.name || 'Station';

    if (!stationId) {
      this.logger.error('Could not identify the station to process alerts.');
      return;
    }

    // 2. FETCH FAVORITES
    // Find all users who have this station in their favorites list.
    const stationFavorites = await this.alertLogRepository.manager
      .createQueryBuilder(UserFavorite, 'fav')
      .leftJoinAndSelect('fav.user', 'user')
      .leftJoinAndSelect('user.healthProfile', 'hp')
      .where('fav.stationId = :stationId', { stationId })
      .getMany();

    if (stationFavorites.length === 0) return;

    for (const fav of stationFavorites) {
      const user = fav.user;
      if (!user || !user.healthProfile) continue;

      // 3. FETCH THRESHOLD
      // Find the specific threshold for the user's pathology and sensitivity level.
      const threshold = await this.thresholdRepository.findOne({
        where: {
          condition: user.healthProfile.condition,
          sensitivity: user.healthProfile.sensitivityLevel,
        },
      });

      // 4. VALIDATE AGAINST THRESHOLD
      if (threshold && measurement.aqi >= threshold.min_aqi) {
        
        // --- ACCUMULATION LOGIC ---
        // Check if an UNREAD alert already exists for this user and THIS exact measurement.
        // This prevents duplicate alerts within the same synchronization cycle.
        const existingAlert = await this.alertLogRepository.findOne({
          where: { 
            user: { id: user.id }, 
            measurement: { id: measurement.id },
            is_read: false 
          }
        });

        if (!existingAlert) {
          const alertMessage = `[Alert in ${fav.alias || stationName}] ${threshold.message_template} (AQI: ${measurement.aqi})`;
          
          // Create a NEW record (ensures the badge accumulates: 1, 2, 3...)
          const newAlert = this.alertLogRepository.create({
            message: alertMessage,
            user: user,
            measurement: measurement,
            is_read: false, // Default status for new alerts
          });

          await this.alertLogRepository.save(newAlert);
          this.logger.warn(`New alert accumulated for ${user.email}. AQI: ${measurement.aqi}`);
        }
      }
    }
  }
}