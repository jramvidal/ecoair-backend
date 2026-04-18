import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StationsService } from './stations.service';
// Added specific Swagger decorators for parameters, queries and bodies
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all stations', 
    description: 'Retrieves a list of all air quality monitoring stations currently stored in the database.' 
  })
  async findAll() {
    return await this.stationsService.findAll();
  }

  @Get(':id/history')
  @ApiOperation({ 
    summary: 'Get station history for charts', 
    description: 'Returns historical air quality readings for a specific station, filtered by a limit of records.' 
  })
  @ApiParam({ name: 'id', description: 'The unique ID of the station' })
  @ApiQuery({ name: 'limit', description: 'Number of recent readings to return', required: false, example: 24 })
  async getStationHistory(
    @Param('id') id: string, 
    @Query('limit') limit: number = 24
  ) {
    return await this.stationsService.getStationHistory(+id, limit);
  }

  @Get('cron/status')
  @ApiOperation({ 
    summary: 'Check CRON job status', 
    description: 'Returns information about the current state and next execution of the automatic data sync task.' 
  })
  async getCronStatus() {
    return this.stationsService.getCronStatus();
  }

  @Post('cron/frequency')
  @ApiOperation({ 
    summary: 'Update sync frequency', 
    description: 'Modifies the interval (in minutes) for the background data collection process.' 
  })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { minutes: { type: 'number', example: 60 } } 
    } 
  })
  async updateFrequency(@Body() body: { minutes: number }) {
    return this.stationsService.updateCronFrequency(body.minutes);
  }

  @Post('sync/bounds')
  @ApiOperation({ 
    summary: 'Sync stations by map bounds', 
    description: 'Triggers a synchronization of stations located within specific geographical coordinates (Southwest and Northeast corners).' 
  })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        swLat: { type: 'number', example: 40.40 }, 
        swLon: { type: 'number', example: -3.72 }, 
        neLat: { type: 'number', example: 40.45 }, 
        neLon: { type: 'number', example: -3.65 } 
      } 
    } 
  })
  async syncByBounds(@Body() body: any) {
    return await this.stationsService.syncByBounds(body.swLat, body.swLon, body.neLat, body.neLon);
  }

  @Post('sync/coords')
  @ApiOperation({ 
    summary: 'Sync station by coordinates', 
    description: 'Finds and synchronizes the nearest station to a specific latitude and longitude.' 
  })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        lat: { type: 'number', example: 40.4167 }, 
        lon: { type: 'number', example: -3.7033 } 
      } 
    } 
  })
  async syncByCoords(@Body() body: { lat: number; lon: number }) {
    return await this.stationsService.syncByCoords(body.lat, body.lon);
  }

  @Post('sync/:city')
  @ApiOperation({ 
    summary: 'Sync station by city name', 
    description: 'Forces an immediate data update from the API for a specific city name.' 
  })
  @ApiParam({ name: 'city', description: 'Name of the city (e.g., Madrid, Barcelona)', example: 'Madrid' })
  async syncStation(@Param('city') city: string) {
    return await this.stationsService.syncStationData(city);
  }
}