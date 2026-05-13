import { Test, TestingModule } from '@nestjs/testing';
import { AlertsLogController } from './alerts-log.controller';
import { AlertsLogService } from './alerts-log.service';
import { describe, it, expect, jest, beforeEach } from '@jest/globals'; 

describe('AlertsLogController', () => {
  let controller: AlertsLogController;
  let service: any;

  const mockAlertsLogService = {
    createThreshold: jest.fn().mockResolvedValue({ id: 1, condition: 'Asthma' }),
    getAllThresholds: jest.fn().mockResolvedValue([{ id: 1, condition: 'Asthma' }]),
    updateThreshold: jest.fn().mockResolvedValue({ id: 1, condition: 'Asthma Updated' }),
    findByUserId: jest.fn().mockResolvedValue([{ id: 1, message: 'High Pollution' }]),
    countByUserId: jest.fn().mockResolvedValue(5),
    markAsRead: jest.fn().mockResolvedValue({ affected: 5 }),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
    clearAll: jest.fn().mockResolvedValue({ affected: 10 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsLogController],
      providers: [
        {
          provide: AlertsLogService,
          useValue: mockAlertsLogService,
        },
      ],
    }).compile();

    controller = module.get<AlertsLogController>(AlertsLogController);
    service = module.get<AlertsLogService>(AlertsLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a threshold', async () => {
      const dto = { condition: 'Asthma', min_aqi: 100, sensitivity: 'High', message_template: 'Warning' } as any;
      const result = await controller.create(dto);
      expect(result).toEqual({ id: 1, condition: 'Asthma' } as any);
      expect(service.createThreshold).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all thresholds', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1, condition: 'Asthma' }] as any);
      expect(service.getAllThresholds).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a threshold', async () => {
      const result = await controller.update('1', { condition: 'Asthma Updated' });
      expect(result).toEqual({ id: 1, condition: 'Asthma Updated' } as any);
      expect(service.updateThreshold).toHaveBeenCalledWith(1, { condition: 'Asthma Updated' });
    });
  });

  describe('getUserAlerts', () => {
    it('should return alerts for a user', async () => {
      const result = await controller.getUserAlerts('1');
      expect(result).toEqual([{ id: 1, message: 'High Pollution' }] as any);
      expect(service.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('getAlertCount', () => {
    it('should return alert count for a user', async () => {
      const result = await controller.getAlertCount('1');
      expect(result).toEqual({ count: 5 } as any);
      expect(service.countByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark user alerts as read', async () => {
      const result = await controller.markAsRead('1');
      expect(result).toEqual({ affected: 5 } as any);
      expect(service.markAsRead).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteAlert', () => {
    it('should delete a specific alert', async () => {
      const result = await controller.deleteAlert('1');
      expect(result).toEqual({ affected: 1 } as any);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('clearHistory', () => {
    it('should clear all alerts for a user', async () => {
      const result = await controller.clearHistory('1');
      expect(result).toEqual({ affected: 10 } as any);
      expect(service.clearAll).toHaveBeenCalledWith(1);
    });
  });
});
