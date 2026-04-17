import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  async findAll() {
    return await this.stationsService.findAll();
  }

  // --- NEW ROUTE: Fetch history for charts ---
  @Get(':id/history')
  async getStationHistory(
    @Param('id') id: string, 
    @Query('limit') limit: number = 24 // By default, the last 24 readings
  ) {
    return await this.stationsService.getStationHistory(+id, limit);
  }

  @Get('cron/status')
  async getCronStatus() {
    return this.stationsService.getCronStatus();
  }

  @Post('cron/frequency')
  async updateFrequency(@Body() body: { minutes: number }) {
    return this.stationsService.updateCronFrequency(body.minutes);
  }

  @Post('sync/bounds')
  async syncByBounds(@Body() body: any) {
    return await this.stationsService.syncByBounds(body.swLat, body.swLon, body.neLat, body.neLon);
  }

  @Post('sync/coords')
  async syncByCoords(@Body() body: { lat: number; lon: number }) {
    return await this.stationsService.syncByCoords(body.lat, body.lon);
  }

  @Post('sync/:city')
  async syncStation(@Param('city') city: string) {
    return await this.stationsService.syncStationData(city);
  }
}