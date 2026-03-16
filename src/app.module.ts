import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config'; // <--- Importante
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { HealthProfilesModule } from './health-profiles/health-profiles.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { StationsModule } from './stations/stations.module';
import { UserFavoritesModule } from './user-favorites/user-favorites.module';
import { AlertsLogModule } from './alerts-log/alerts-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // <--- Carga el .env para toda la app
    ScheduleModule.forRoot(), // <--- Activa el reloj interno de NestJS
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'user_ecoair',
      password: 'password_ecoair',
      database: 'ecoair_db',
      autoLoadEntities: true, // Esto ayuda a cargar las entidades automáticamente
      synchronize: true,
    }),
    UsersModule, // <--- Verifica que esté aquí
    HealthProfilesModule,
    MeasurementsModule,
    StationsModule,
    UserFavoritesModule,
    AlertsLogModule, // <--- Y que este también
  ],
})
export class AppModule {}
