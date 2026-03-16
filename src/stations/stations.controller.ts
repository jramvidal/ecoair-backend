import { Controller, Post, Param } from '@nestjs/common';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post('sync/:city')
  async sync(@Param('city') city: string) {
    return await this.stationsService.syncStatonData(city);
  }
}