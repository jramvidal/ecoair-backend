import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertLog } from './alerts-log.entity';
import { AlertThreshold } from './alert-threshold.entity';
import { CreateThresholdDto } from './dto/create-threshold.dto';

@Injectable()
export class AlertsLogService {
  constructor(
    @InjectRepository(AlertLog)
    private alertLogRepository: Repository<AlertLog>,
    @InjectRepository(AlertThreshold)
    private thresholdRepository: Repository<AlertThreshold>,
  ) {}

  // Método para que el ADMIN cree nuevas reglas de alerta
  async createThreshold(dto: CreateThresholdDto) {
    const newThreshold = this.thresholdRepository.create(dto);
    return await this.thresholdRepository.save(newThreshold);
  }

  // Método para obtener todas las reglas (útil para el panel admin)
  async getAllThresholds() {
    return await this.thresholdRepository.find();
  }
}