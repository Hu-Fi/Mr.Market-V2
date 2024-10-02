import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';
import { DbHealthService } from '../db.health.service';
import { TseHealthService } from '../tse.health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let dbHealthService: DbHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DbHealthService,
          useValue: {
            checkDbHealth: jest.fn(),
          },
        },
        {
          provide: TseHealthService,
          useValue: {
            checkDbHealth: jest.fn(),
          },
        },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
    dbHealthService = module.get<DbHealthService>(DbHealthService);
  });

  describe('geHealthStatuses', () => {
    it('should return combined health statuses', async () => {
      const checkDbHealthFixture = {
        'last database read': Date.now,
        'last database write': Date.now,
        'last database change': Date.now,
      };
      jest
        .spyOn(dbHealthService, 'checkDbHealth')
        .mockResolvedValue(checkDbHealthFixture);

      const result = await healthService.geHealthStatuses();
      expect(result).toEqual({
        db: checkDbHealthFixture,
      });
    });
  });
});
