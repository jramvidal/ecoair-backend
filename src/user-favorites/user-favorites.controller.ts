import { Controller, Post, Body } from '@nestjs/common';
import { UserFavoritesService } from './user-favorites.service';

@Controller('user-favorites')
export class UserFavoritesController {
  constructor(private readonly favoritesService: UserFavoritesService) {}

  @Post()
  async create(@Body() createFavoriteDto: { userId: number; stationId: number; alias: string }) {
    return this.favoritesService.create(createFavoriteDto);
  }
}