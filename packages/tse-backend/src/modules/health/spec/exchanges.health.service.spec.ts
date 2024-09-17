import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CcxtGateway } from '../../../integrations/ccxt.gateway';
import { ExchangesHealthService } from '../exchanges.health.service';
import { CustomLogger } from '../../logger/logger.service';

jest.mock('../../../common/utils/config-utils', () => ({
  buildExchangeConfigs: jest.fn(() => ({
    exchange1: {},
    exchange2: {},
  })),
}));

describe('ExchangesHealthService', () => {
  let exchangesHealthService: ExchangesHealthService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockCcxtGateway: jest.Mocked<CcxtGateway>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockCcxtGateway = {
      getExchangesNames: jest.fn(),
    } as unknown as jest.Mocked<CcxtGateway>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangesHealthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CcxtGateway, useValue: mockCcxtGateway },
        CustomLogger,
      ],
    }).compile();

    exchangesHealthService = module.get<ExchangesHealthService>(
      ExchangesHealthService,
    );
  });

  describe('checkExchanges', () => {
    it('should return UP when all expected exchanges are present', async () => {
      mockConfigService.get.mockReturnValue({ exchange1: {}, exchange2: {} });
      mockCcxtGateway.getExchangesNames.mockReturnValue(
        new Set(['exchange1', 'exchange2']).values(),
      );

      const result = await exchangesHealthService.checkExchanges();
      expect(result).toEqual({ status: 'UP', details: {} });
    });

    it('should return DOWN with missing exchanges when some exchanges are missing', async () => {
      mockConfigService.get.mockReturnValue({ exchange1: {}, exchange2: {} });
      mockCcxtGateway.getExchangesNames.mockReturnValue(
        new Set(['exchange1']).values(),
      );

      const result = await exchangesHealthService.checkExchanges();
      expect(result).toEqual({
        status: 'DOWN',
        details: { missingExchanges: ['exchange2'] },
      });
    });
  });
});
