import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavorite } from './user-favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserFavorite])],
  exports: [TypeOrmModule],
})
export class UserFavoritesModule {}
