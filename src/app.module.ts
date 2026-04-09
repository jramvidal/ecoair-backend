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
    ConfigModule.forRoot({ isGlobal: true }), // <--- Load the .env file for the whole application.
    ScheduleModule.forRoot(), // <--- Enable the internal NestJS clock.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'user_ecoair',
      password: 'password_ecoair',
      database: 'ecoair_db',
      autoLoadEntities: true, // This enables automatic entity loading.
      synchronize: true,
    }),
    UsersModule, 
    HealthProfilesModule,
    MeasurementsModule,
    StationsModule,
    UserFavoritesModule,
    AlertsLogModule, 
  ],
})
export class AppModule {}
