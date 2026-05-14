import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  const mockUsersService = {
    create: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
    login: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', token: 'jwt-token' }),
    updateProfile: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Name' }),
    registerDeviceToken: jest.fn().mockResolvedValue({ message: 'Token saved' }),
    removeDeviceToken: jest.fn().mockResolvedValue({ message: 'Token removed' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create a user', async () => {
      const dto = { email: 'test@example.com', password: 'password', name: 'Test User' };
      const result = await controller.register(dto);
      expect(result).toEqual({ id: 1, email: 'test@example.com' } as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should authenticate a user', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const result = await controller.login(dto);
      expect(result).toEqual({ id: 1, email: 'test@example.com', token: 'jwt-token' } as any);
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const result = await controller.updateProfile('1', { name: 'Updated Name' });
      expect(result).toEqual({ id: 1, name: 'Updated Name' } as any);
      expect(service.updateProfile).toHaveBeenCalledWith(1, { name: 'Updated Name' });
    });
  });

  describe('registerDeviceToken', () => {
    it('should register a device token', async () => {
      const result = await controller.registerDeviceToken('1', { fcmToken: 'token123', deviceType: 'web' });
      expect(result).toEqual({ message: 'Token saved' } as any);
      expect(service.registerDeviceToken).toHaveBeenCalledWith(1, 'token123', 'web');
    });
  });

  describe('removeDeviceToken', () => {
    it('should remove a device token', async () => {
      const result = await controller.removeDeviceToken('1', { fcmToken: 'token123' });
      expect(result).toEqual({ message: 'Token removed' } as any);
      expect(service.removeDeviceToken).toHaveBeenCalledWith(1, 'token123');
    });
  });
});
