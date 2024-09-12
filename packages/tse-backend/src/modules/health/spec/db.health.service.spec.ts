import { Test, TestingModule } from '@nestjs/testing';
import { DbHealthService } from '../db.health.service';
import { CustomLogger } from '../../logger/logger.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('DbHealthService', () => {
  let dbHealthService: DbHealthService;
  let cacheManager: Cache & { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    const cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbHealthService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        CustomLogger,
      ],
    }).compile();

    dbHealthService = module.get<DbHealthService>(DbHealthService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('checkDbHealth', () => {
    it('should return the last database read, write, and change timestamps', async () => {
      const mockRead = '1726155035';
      const mockWrite = '1726155035';
      const mockChange = '1726155035';

      cacheManager.get.mockResolvedValueOnce(mockRead);
      cacheManager.get.mockResolvedValueOnce(mockWrite);
      cacheManager.get.mockResolvedValueOnce(mockChange);

      const result = await dbHealthService.checkDbHealth();

      expect(cacheManager.get).toHaveBeenCalledWith('SELECT');
      expect(cacheManager.get).toHaveBeenCalledWith('INSERT');
      expect(cacheManager.get).toHaveBeenCalledWith('UPDATE');

      expect(result).toEqual({
        'last database read': mockRead,
        'last database write': mockWrite,
        'last database change': mockChange,
      });
    });
  });
});
