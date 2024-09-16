import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';

describe('HealthController', () => {
  let controller: HealthController;

  const mockHealthService = {
    geHealthStatuses: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health statuses', async () => {
      const healthStatuses = {
        db: { status: 'UP', details: {} },
        exchanges: { status: 'UP', details: {} },
      };
      mockHealthService.geHealthStatuses.mockResolvedValue(healthStatuses);

      const result = await controller.getHealth();
      expect(result).toEqual(healthStatuses);
      expect(mockHealthService.geHealthStatuses).toHaveBeenCalled();
    });
  });
});
