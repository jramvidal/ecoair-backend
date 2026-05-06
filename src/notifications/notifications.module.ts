import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { UserDevice } from '../users/user-device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDevice])],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
