import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UserFavoritesService } from './user-favorites.service';

@Controller('user-favorites')
export class UserFavoritesController {
  constructor(private readonly favoritesService: UserFavoritesService) {}

  // Create or modify a favorite's alias.
  @Post()
  async create(@Body() createFavoriteDto: { userId: number; stationId: number; alias: string }) {
    return this.favoritesService.create(createFavoriteDto);
  }

  // Retrieve a list of favorites for a specific user.
  // GET http://localhost:3000/user-favorites/user/6
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return await this.favoritesService.findAllByUser(Number(userId));
  }

  // Remove a favorite (Unfollow).
  // DELETE http://localhost:3000/user-favorites/12
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.favoritesService.remove(Number(id));
  }
}