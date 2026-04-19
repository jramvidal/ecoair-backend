import { Test, TestingModule } from '@nestjs/testing';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { describe, it, expect, jest, beforeEach } from '@jest/globals'; 

describe('StationsController', () => {
  let controller: StationsController;
  let service: any; // 1. Cambiamos el tipo a any aquí

  // 2. Definimos el mock como any para que acepte cualquier objeto
  const mockStationsService: any = {
    findAll: jest.fn().mockResolvedValue([
      { id: 1, name: 'Estación de Prueba', aqi: 42 }
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StationsController],
      providers: [
        {
          provide: StationsService,
          useValue: mockStationsService,
        },
      ],
    }).compile();

    controller = module.get<StationsController>(StationsController);
    service = module.get<StationsService>(StationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of stations', async () => {
      const result = await controller.findAll();
      
      // 3. Comparamos usando "as any" para evitar conflictos de tipos de entidad
      expect(result).toEqual([{ id: 1, name: 'Estación de Prueba', aqi: 42 }] as any);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});