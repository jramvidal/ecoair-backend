import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertLog } from './alerts-log.entity';
import { AlertThreshold } from './alert-threshold.entity'; // Importa la nueva entidad
import { AlertsLogService } from './alerts-log.service';
import { AlertsLogController } from './alerts-log.controller';

@Module({
  imports: [
    // Register both entities here.
    TypeOrmModule.forFeature([AlertLog, AlertThreshold]) 
  ],
  providers: [AlertsLogService],
  controllers: [AlertsLogController],
  exports: [TypeOrmModule, AlertsLogService]
})
export class AlertsLogModule {}
