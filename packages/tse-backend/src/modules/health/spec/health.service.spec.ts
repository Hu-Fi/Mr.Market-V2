import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { CcxtGateway } from '../../../integrations/ccxt.gateway';
import { HealthService } from '../health.service';
import { CustomLogger } from '../../logger/logger.service';

jest.mock('../../../common/utils/config-utils', () => ({
  buildExchangeConfigs: jest.fn(() => ({
    exchange1: {},
    exchange2: {},
  })),
}));

describe('HealthService', () => {
  let healthService: HealthService;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockCcxtGateway: jest.Mocked<CcxtGateway>;

  beforeEach(async () => {
    mockEntityManager = {
      query: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    mockDataSource = {
      entityMetadatas: [
        { tableName: 'table1' },
        { tableName: 'table2' },
      ] as unknown as any[],
    } as jest.Mocked<DataSource>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockCcxtGateway = {
      getExchangesNames: jest.fn(),
    } as unknown as jest.Mocked<CcxtGateway>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: getEntityManagerToken(), useValue: mockEntityManager },
        { provide: DataSource, useValue: mockDataSource },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CcxtGateway, useValue: mockCcxtGateway },
        CustomLogger,
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  describe('checkDbHealth', () => {
    it('should return UP when all expected tables exist', async () => {
      mockEntityManager.query.mockResolvedValue([
        { table_name: 'table1' },
        { table_name: 'table2' },
        { table_name: 'migrations' },
      ]);

      const result = await healthService.checkDbHealth();
      expect(result).toEqual({ status: 'UP', details: {} });
    });

    it('should return DOWN with missing tables when some tables are missing', async () => {
      mockEntityManager.query.mockResolvedValue([{ table_name: 'table1' }]);

      const result = await healthService.checkDbHealth();
      expect(result).toEqual({
        status: 'DOWN',
        details: { missingTables: ['table2', 'migrations'] },
      });
    });

    it('should return DOWN with error details when there is an exception', async () => {
      mockEntityManager.query.mockRejectedValue(new Error('Database error'));

      const result = await healthService.checkDbHealth();
      expect(result).toEqual({
        status: 'DOWN',
        details: { error: 'Database error' },
      });
    });
  });

  describe('checkExchanges', () => {
    it('should return UP when all expected exchanges are present', async () => {
      mockConfigService.get.mockReturnValue({ exchange1: {}, exchange2: {} });
      mockCcxtGateway.getExchangesNames.mockReturnValue(
        new Set(['exchange1', 'exchange2']).values(),
      );

      const result = await healthService.checkExchanges();
      expect(result).toEqual({ status: 'UP', details: {} });
    });

    it('should return DOWN with missing exchanges when some exchanges are missing', async () => {
      mockConfigService.get.mockReturnValue({ exchange1: {}, exchange2: {} });
      mockCcxtGateway.getExchangesNames.mockReturnValue(
        new Set(['exchange1']).values(),
      );

      const result = await healthService.checkExchanges();
      expect(result).toEqual({
        status: 'DOWN',
        details: { missingExchanges: ['exchange2'] },
      });
    });
  });

  describe('geHealthStatuses', () => {
    it('should return combined health statuses', async () => {
      jest
        .spyOn(healthService, 'checkDbHealth')
        .mockResolvedValue({ status: 'UP', details: {} });
      jest
        .spyOn(healthService, 'checkExchanges')
        .mockResolvedValue({ status: 'UP', details: {} });

      const result = await healthService.geHealthStatuses();
      expect(result).toEqual({
        db: { status: 'UP', details: {} },
        exchanges: { status: 'UP', details: {} },
      });
    });
  });
});
