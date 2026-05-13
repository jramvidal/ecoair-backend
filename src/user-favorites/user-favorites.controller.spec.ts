import { Test, TestingModule } from '@nestjs/testing';
import { UserFavoritesController } from './user-favorites.controller';
import { UserFavoritesService } from './user-favorites.service';
import { describe, it, expect, jest, beforeEach } from '@jest/globals'; 

describe('UserFavoritesController', () => {
  let controller: UserFavoritesController;
  let service: any;

  const mockUserFavoritesService = {
    create: jest.fn().mockResolvedValue({ id: 1, alias: 'Home' }),
    findAllByUser: jest.fn().mockResolvedValue([{ id: 1, alias: 'Home' }]),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFavoritesController],
      providers: [
        {
          provide: UserFavoritesService,
          useValue: mockUserFavoritesService,
        },
      ],
    }).compile();

    controller = module.get<UserFavoritesController>(UserFavoritesController);
    service = module.get<UserFavoritesService>(UserFavoritesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user favorite', async () => {
      const dto = { userId: 1, stationId: 2, alias: 'Home' };
      const result = await controller.create(dto);
      expect(result).toEqual({ id: 1, alias: 'Home' } as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findByUser', () => {
    it('should return favorites for a user', async () => {
      const result = await controller.findByUser('1');
      expect(result).toEqual([{ id: 1, alias: 'Home' }] as any);
      expect(service.findAllByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should remove a favorite', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ affected: 1 } as any);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
