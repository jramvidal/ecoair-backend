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
    // Registramos las entidades que el StationsService usará directamente
    TypeOrmModule.forFeature([Station, Measurement]),
    // Necesario para las peticiones a la API de WAQI
    HttpModule,
    // Importamos el módulo de alertas para poder inyectar su servicio
    AlertsLogModule 
  ],
  providers: [StationsService],
  controllers: [StationsController],
  // Exportamos StationsService por si en el futuro lo necesitamos en otros módulos
  exports: [StationsService] 
})
export class StationsModule {}
