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

  /**
   * Creates a new alert threshold for health conditions
   */
  async createThreshold(dto: CreateThresholdDto) {
    const newThreshold = this.thresholdRepository.create(dto);
    return await this.thresholdRepository.save(newThreshold);
  }

  /**
   * Retrieves all thresholds ordered by pathology and sensitivity
   */
  async getAllThresholds() {
    return await this.thresholdRepository.find({
      order: {
        condition: 'ASC',   // Alphabetical order by pathology
        sensitivity: 'ASC', // Second criteria: by sensitivity level
      },
    });
  }

  /**
   * Updates an existing threshold partially
   */
  async updateThreshold(id: number, data: Partial<AlertThreshold>) {
    await this.thresholdRepository.update(id, data);
    return await this.thresholdRepository.findOneBy({ id });
  }

  /**
   * Finds alerts associated with a specific user
   */
  async findByUserId(userId: number) {
    return await this.alertLogRepository.find({
      where: { user: { id: userId } },
      order: { sent_at: 'DESC' },
    });
  }

  /**
   * Counts unread alerts for the notification badge
   */
  async countByUserId(userId: number): Promise<number> {
    // Counts all alerts that the user has not yet marked as read
    return await this.alertLogRepository.count({
      where: { user: { id: userId }, is_read: false },
    });
  }

  /**
   * Marks all user alerts as read
   */
  async markAsRead(userId: number) {
    // Updates the status of ALL pending alerts for the user to "read"
    await this.alertLogRepository.update(
      { user: { id: userId }, is_read: false },
      { is_read: true },
    );
    return { success: true };
  }

  /**
   * Deletes a single alert log by ID
   */
  async remove(id: number) {
    return await this.alertLogRepository.delete(id);
  }

  /**
   * Clears the entire alert history for a user
   */
  async clearAll(userId: number) {
    return await this.alertLogRepository.delete({ user: { id: userId } });
  }

  /**
   * Core logic: Analyzes a measurement and generates alerts for interested users
   */
  async checkAndCreateAlerts(measurement: Measurement) {
    // 1. ROBUST STATION IDENTIFICATION
    // TypeORM relations can be unpredictable after save operations.
    // We check several possible paths to find the station identifier.
    const stationId = 
      measurement.station?.id || 
      (measurement as any).stationId || 
      (typeof measurement.station === 'number' ? measurement.station : null);

    const stationName = measurement.station?.name || 'Station';

    if (!stationId) {
      // Log the full object to help debug why the station is missing
      this.logger.error(`Could not identify the station to process alerts. Data received: ${JSON.stringify(measurement)}`);
      return;
    }

    // 2. FETCH USERS WHO FAVORITED THIS STATION
    // Includes health profile data to evaluate against thresholds.
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

      // 3. RETRIEVE RELEVANT THRESHOLD
      // Matches the user's specific health condition and sensitivity.
      const threshold = await this.thresholdRepository.findOne({
        where: {
          condition: user.healthProfile.condition,
          sensitivity: user.healthProfile.sensitivityLevel,
        },
      });

      // 4. THRESHOLD VALIDATION AND ALERT GENERATION
      if (threshold && measurement.aqi >= threshold.min_aqi) {
        
        // --- PREVENT DUPLICATES ---
        // Verify if an unread alert for this specific measurement already exists.
        const existingAlert = await this.alertLogRepository.findOne({
          where: { 
            user: { id: user.id }, 
            measurement: { id: measurement.id },
            is_read: false 
          }
        });

        if (!existingAlert) {
          const alertMessage = `[Alert in ${fav.alias || stationName}] ${threshold.message_template} (AQI: ${measurement.aqi})`;
          
          // Create a NEW record for the notification history
          const newAlert = this.alertLogRepository.create({
            message: alertMessage,
            user: user,
            measurement: measurement,
            is_read: false, 
          });

          await this.alertLogRepository.save(newAlert);
          this.logger.warn(`New alert accumulated for ${user.email}. AQI: ${measurement.aqi}`);
        }
      }
    }
  }
}