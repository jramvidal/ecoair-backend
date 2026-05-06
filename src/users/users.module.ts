import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { UserDevice } from './user-device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDevice])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
