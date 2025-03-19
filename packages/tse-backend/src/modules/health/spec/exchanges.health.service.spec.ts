import { Test, TestingModule } from '@nestjs/testing';
import { ExchangesHealthService } from '../exchanges.health.service';
import { CustomLogger } from '../../logger/logger.service';
import { CcxtIntegrationService } from '../../../integrations/ccxt.integration.service';

describe('ExchangesHealthService', () => {
  let exchangesHealthService: ExchangesHealthService;
  let mockCcxtGateway: jest.Mocked<CcxtIntegrationService>;

  beforeEach(async () => {
    mockCcxtGateway = {
      getExchangeNames: jest.fn(),
    } as unknown as jest.Mocked<CcxtIntegrationService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangesHealthService,
        { provide: CcxtIntegrationService, useValue: mockCcxtGateway },
        CustomLogger,
      ],
    }).compile();

    exchangesHealthService = module.get<ExchangesHealthService>(
      ExchangesHealthService,
    );
  });

  describe('checkExchanges', () => {
    it('should return UP when there are initialized exchanges', async () => {
      mockCcxtGateway.getExchangeNames.mockResolvedValue(
        new Set(['binance', 'kraken']),
      );

      const result = await exchangesHealthService.checkExchanges();

      expect(result).toEqual({
        status: 'UP',
        details: {
          initialized: 'binance, kraken',
        },
      });
      expect(mockCcxtGateway.getExchangeNames).toHaveBeenCalledTimes(1);
    });

    it('should return DOWN when there are no initialized exchanges', async () => {
      mockCcxtGateway.getExchangeNames.mockResolvedValue(new Set());

      const result = await exchangesHealthService.checkExchanges();

      expect(result).toEqual({
        status: 'DOWN',
        details: {
          initialized: '',
        },
      });
      expect(mockCcxtGateway.getExchangeNames).toHaveBeenCalledTimes(1);
    });
  });
});
