import { Controller, Post, Body, Get } from '@nestjs/common';
import { AlertsLogService } from './alerts-log.service';
import { CreateThresholdDto } from './dto/create-threshold.dto';

@Controller('alerts-log')
export class AlertsLogController {
  constructor(private readonly alertsLogService: AlertsLogService) {}

  // Ruta para que el Admin cree una nueva regla
  // POST http://localhost:3000/alerts-log/thresholds
  @Post('thresholds')
  async create(@Body() createThresholdDto: CreateThresholdDto) {
    return await this.alertsLogService.createThreshold(createThresholdDto);
  }

  // Ruta para ver todas las reglas configuradas
  // GET http://localhost:3000/alerts-log/thresholds
  @Get('thresholds')
  async findAll() {
    return await this.alertsLogService.getAllThresholds();
  }
}