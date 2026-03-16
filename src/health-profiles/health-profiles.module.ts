import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthProfilesService } from './health-profiles.service';
import { HealthProfilesController } from './health-profiles.controller';
import { HealthProfile } from './health-profile.entity'; // Importa la entidad

@Module({
  imports: [TypeOrmModule.forFeature([HealthProfile])], // <--- ESTO ES CLAVE
  providers: [HealthProfilesService],
  controllers: [HealthProfilesController],
  exports: [TypeOrmModule] // Lo exportamos para que otros módulos lo vean
})
export class HealthProfilesModule {}
