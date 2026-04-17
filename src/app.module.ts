import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { HealthProfilesModule } from './health-profiles/health-profiles.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { StationsModule } from './stations/stations.module';
import { UserFavoritesModule } from './user-favorites/user-favorites.module';
import { AlertsLogModule } from './alerts-log/alerts-log.module';

@Module({
  imports: [
    // Loads environment variables from the .env file
    ConfigModule.forRoot({ isGlobal: true }),
    
    ScheduleModule.forRoot(),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      // We use process.env to read values from the .env file
      host: process.env.DATABASE_HOST,
      
      // If DATABASE_PORT is undefined, it will use '5433' by default
      port: parseInt(process.env.DATABASE_PORT || '5433', 10),
      
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      
      // We keep synchronize set to true for local development
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