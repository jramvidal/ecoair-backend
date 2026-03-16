import { Test, TestingModule } from '@nestjs/testing';
import { HealthProfilesController } from './health-profiles.controller';

describe('HealthProfilesController', () => {
  let controller: HealthProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthProfilesController],
    }).compile();

    controller = module.get<HealthProfilesController>(HealthProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
