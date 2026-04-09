import { Injectable, NotFoundException } from '@nestjs/common';
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
    // 1. Check if this favorite already exists for this user.
    let favorite = await this.favoritesRepository.findOne({
      where: { 
        userId: data.userId, 
        stationId: data.stationId 
      }
    });

    if (favorite) {
      // 2. If it already exists, update the alias to reflect any changes.
      favorite.alias = data.alias;
      return await this.favoritesRepository.save(favorite);
    }

    // 3. If it does not exist, create it from scratch.
    favorite = this.favoritesRepository.create(data);
    return await this.favoritesRepository.save(favorite);
  }

  // Retrieve favorites including their associated station and its measurements.
  async findAllByUser(userId: number) {
    return await this.favoritesRepository.find({
      where: { userId },
      relations: ['station', 'station.measurements'],
      order: { id: 'DESC' } // Los más nuevos primero
    });
  }

  // NUEVO: Remove a favorite (Unfollow).
  async remove(id: number) {
    const result = await this.favoritesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Favorito con ID ${id} no encontrado`);
    }
    return { message: 'Favorito eliminado con éxito' };
  }
}