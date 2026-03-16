import { Test, TestingModule } from '@nestjs/testing';
import { HealthProfilesService } from './health-profiles.service';

describe('HealthProfilesService', () => {
  let service: HealthProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthProfilesService],
    }).compile();

    service = module.get<HealthProfilesService>(HealthProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
