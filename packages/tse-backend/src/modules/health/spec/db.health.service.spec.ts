import { Test, TestingModule } from '@nestjs/testing';
import { DbHealthService } from '../db.health.service';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { CustomLogger } from '../../logger/logger.service';

describe('DbHealthService', () => {
  let dbHealthService: DbHealthService;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockDataSource: jest.Mocked<DataSource>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbHealthService,
        { provide: getEntityManagerToken(), useValue: mockEntityManager },
        { provide: DataSource, useValue: mockDataSource },
        CustomLogger,
      ],
    }).compile();

    dbHealthService = module.get<DbHealthService>(DbHealthService);
  });

  describe('checkDbHealth', () => {
    it('should return UP when all expected tables exist', async () => {
      mockEntityManager.query.mockResolvedValue([
        { table_name: 'table1' },
        { table_name: 'table2' },
        { table_name: 'migrations' },
      ]);

      const result = await dbHealthService.checkDbHealth();
      expect(result).toEqual({ status: 'UP', details: {} });
    });

    it('should return DOWN with missing tables when some tables are missing', async () => {
      mockEntityManager.query.mockResolvedValue([{ table_name: 'table1' }]);

      const result = await dbHealthService.checkDbHealth();
      expect(result).toEqual({
        status: 'DOWN',
        details: { missingTables: ['table2', 'migrations'] },
      });
    });

    it('should return DOWN with error details when there is an exception', async () => {
      mockEntityManager.query.mockRejectedValue(new Error('Database error'));

      const result = await dbHealthService.checkDbHealth();
      expect(result).toEqual({
        status: 'DOWN',
        details: { error: 'Database error' },
      });
    });
  });
});
