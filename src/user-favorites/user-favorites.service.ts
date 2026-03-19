import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavorite } from './user-favorite.entity';

@Injectable()
export class UserFavoritesService {
  constructor(
    @InjectRepository(UserFavorite)
    private readonly favoritesRepository: Repository<UserFavorite>,
  ) {}

  async create(data: { userId: number; stationId: number; alias: string }) {
    const favorite = this.favoritesRepository.create(data);
    return await this.favoritesRepository.save(favorite);
  }
}