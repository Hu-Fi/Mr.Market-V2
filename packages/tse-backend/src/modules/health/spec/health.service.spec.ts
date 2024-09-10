import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';
import { DbHealthService } from '../db.health.service';
import { ExchangesHealthService } from '../exchanges.health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let dbHealthService: DbHealthService;
  let exchangesHealthService: ExchangesHealthService;

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
          provide: ExchangesHealthService,
          useValue: {
            checkExchanges: jest.fn(),
          },
        },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
    dbHealthService = module.get<DbHealthService>(DbHealthService);
    exchangesHealthService = module.get<ExchangesHealthService>(ExchangesHealthService);
  });

  describe('geHealthStatuses', () => {
    it('should return combined health statuses', async () => {
      jest
        .spyOn(dbHealthService, 'checkDbHealth')
        .mockResolvedValue({ status: 'UP', details: {} });
      jest
        .spyOn(exchangesHealthService, 'checkExchanges')
        .mockResolvedValue({ status: 'UP', details: {} });

      const result = await healthService.geHealthStatuses();
      expect(result).toEqual({
        db: { status: 'UP', details: {} },
        exchanges: { status: 'UP', details: {} },
      });
    });
  });
});
