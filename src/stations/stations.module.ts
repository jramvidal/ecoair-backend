import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { Station } from './station.entity';
import { Measurement } from '../measurements/measurement.entity';
import { AlertsLogModule } from '../alerts-log/alerts-log.module';

@Module({
  imports: [
    // Register the entities that StationsService will use directly.
    TypeOrmModule.forFeature([Station, Measurement]),
    // Required for WAQI API requests.
    HttpModule,
    // Import AlertsModule to enable service injection.
    AlertsLogModule 
  ],
  providers: [StationsService],
  controllers: [StationsController],
  // Export StationsService for potential future use in other modules.
  exports: [StationsService] 
})
export class StationsModule {}
