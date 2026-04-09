import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { AlertsLogService } from './alerts-log.service';
import { CreateThresholdDto } from './dto/create-threshold.dto';

@Controller('alerts-log')
export class AlertsLogController {
  constructor(private readonly alertsLogService: AlertsLogService) {}

  @Post('thresholds')
  async create(@Body() createThresholdDto: CreateThresholdDto) {
    return await this.alertsLogService.createThreshold(createThresholdDto);
  }

  @Get('thresholds')
  async findAll() {
    return await this.alertsLogService.getAllThresholds();
  }

  // NEW ADMIN ROUTE: Update threshold.
  @Patch('thresholds/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.alertsLogService.updateThreshold(Number(id), body);
  }

  @Get('user/:userId')
  async getUserAlerts(@Param('userId') userId: string) {
    return await this.alertsLogService.findByUserId(Number(userId));
  }

  @Get('count/:userId')
  async getAlertCount(@Param('userId') userId: string) {
    const count = await this.alertsLogService.countByUserId(Number(userId));
    return { count };
  }

  @Patch('read/:userId')
  async markAsRead(@Param('userId') userId: string) {
    return await this.alertsLogService.markAsRead(Number(userId));
  }

  @Delete(':id')
  async deleteAlert(@Param('id') id: string) {
    return await this.alertsLogService.remove(Number(id));
  }

  @Delete('clear/:userId')
  async clearHistory(@Param('userId') userId: string) {
    return await this.alertsLogService.clearAll(Number(userId));
  }
}