import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { AlertsLogService } from './alerts-log.service';
import { CreateThresholdDto } from './dto/create-threshold.dto';
// Added ApiOperation and ApiParam for better documentation
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('alerts-log')
@Controller('alerts-log')
export class AlertsLogController {
  constructor(private readonly alertsLogService: AlertsLogService) {}

  @Post('thresholds')
  @ApiOperation({ 
    summary: 'Create a new health threshold', 
    description: 'Defines a new air quality limit for a specific health condition and sensitivity.' 
  })
  async create(@Body() createThresholdDto: CreateThresholdDto) {
    return await this.alertsLogService.createThreshold(createThresholdDto);
  }

  @Get('thresholds')
  @ApiOperation({ 
    summary: 'Get all health thresholds', 
    description: 'Retrieves the complete list of clinical thresholds and health recommendations stored in the database.' 
  })
  async findAll() {
    return await this.alertsLogService.getAllThresholds();
  }

  @Patch('thresholds/:id')
  @ApiOperation({ 
    summary: 'Update a threshold (Admin)', 
    description: 'Allows modifying an existing health threshold using its unique ID.' 
  })
  @ApiParam({ name: 'id', description: 'Internal ID of the threshold' })
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.alertsLogService.updateThreshold(Number(id), body);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get alerts by User ID', 
    description: 'Retrieves the history of air quality alerts generated for a specific user.' 
  })
  @ApiParam({ name: 'userId', description: 'ID of the user to fetch alerts for' })
  async getUserAlerts(@Param('userId') userId: string) {
    return await this.alertsLogService.findByUserId(Number(userId));
  }

  @Get('count/:userId')
  @ApiOperation({ 
    summary: 'Get unread alerts count', 
    description: 'Returns the total number of alerts for a user that have not been read yet.' 
  })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  async getAlertCount(@Param('userId') userId: string) {
    const count = await this.alertsLogService.countByUserId(Number(userId));
    return { count };
  }

  @Patch('read/:userId')
  @ApiOperation({ 
    summary: 'Mark all alerts as read', 
    description: 'Updates the status of all alerts for a user to "read".' 
  })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  async markAsRead(@Param('userId') userId: string) {
    return await this.alertsLogService.markAsRead(Number(userId));
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a single alert log', 
    description: 'Removes a specific alert entry from the history.' 
  })
  @ApiParam({ name: 'id', description: 'ID of the alert log entry' })
  async deleteAlert(@Param('id') id: string) {
    return await this.alertsLogService.remove(Number(id));
  }

  @Delete('clear/:userId')
  @ApiOperation({ 
    summary: 'Clear user alert history', 
    description: 'Permanently deletes all alert logs for a specific user.' 
  })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  async clearHistory(@Param('userId') userId: string) {
    return await this.alertsLogService.clearAll(Number(userId));
  }
}