import { Test, TestingModule } from '@nestjs/testing';
import { AlertsLogController } from './alerts-log.controller';

describe('AlertsLogController', () => {
  let controller: AlertsLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsLogController],
    }).compile();

    controller = module.get<AlertsLogController>(AlertsLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
