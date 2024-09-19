import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AspectContext } from 'ts-aspect';
import { DatabaseCacheUtil } from '../database.cache.util';
import { SelectStrategy } from '../strategies/select.strategy';
import { InsertStrategy } from '../strategies/insert.strategy';
import { UpdateStrategy } from '../strategies/update.strategy';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  CustomLogger: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('DatabaseCacheUtil', () => {
  let databaseCacheUtil: DatabaseCacheUtil;
  let cacheManager: Cache;
  let selectStrategy: SelectStrategy;
  let insertStrategy: InsertStrategy;
  let updateStrategy: UpdateStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseCacheUtil,
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
        { provide: SelectStrategy, useValue: { execute: jest.fn() } },
        { provide: InsertStrategy, useValue: { execute: jest.fn() } },
        { provide: UpdateStrategy, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    databaseCacheUtil = module.get<DatabaseCacheUtil>(DatabaseCacheUtil);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    selectStrategy = module.get<SelectStrategy>(SelectStrategy);
    insertStrategy = module.get<InsertStrategy>(InsertStrategy);
    updateStrategy = module.get<UpdateStrategy>(UpdateStrategy);
  });

  it('should execute the correct strategy for a find method', async () => {
    const ctx: AspectContext = { methodName: 'findSomething' } as AspectContext;
    (selectStrategy.execute as jest.Mock).mockResolvedValueOnce(null);

    const debugSpy = jest
      .spyOn((databaseCacheUtil as any).logger, 'debug')
      .mockImplementation(() => {});

    await databaseCacheUtil.execute(ctx);

    expect(selectStrategy.execute).toHaveBeenCalledWith(cacheManager);
    expect(debugSpy).toHaveBeenCalledWith(
      'Cache strategy "find" executed successfully for method "findSomething"',
    );
  });

  it('should execute the correct strategy for a create method', async () => {
    const ctx: AspectContext = {
      methodName: 'createSomething',
    } as AspectContext;
    (insertStrategy.execute as jest.Mock).mockResolvedValueOnce(null);

    const debugSpy = jest
      .spyOn((databaseCacheUtil as any).logger, 'debug')
      .mockImplementation(() => {});

    await databaseCacheUtil.execute(ctx);

    expect(insertStrategy.execute).toHaveBeenCalledWith(cacheManager);
    expect(debugSpy).toHaveBeenCalledWith(
      'Cache strategy "create" executed successfully for method "createSomething"',
    );
  });

  it('should execute the correct strategy for an update method', async () => {
    const ctx: AspectContext = {
      methodName: 'updateSomething',
    } as AspectContext;
    (updateStrategy.execute as jest.Mock).mockResolvedValueOnce(null);

    const debugSpy = jest
      .spyOn((databaseCacheUtil as any).logger, 'debug')
      .mockImplementation(() => {});

    await databaseCacheUtil.execute(ctx);

    expect(updateStrategy.execute).toHaveBeenCalledWith(cacheManager);
    expect(debugSpy).toHaveBeenCalledWith(
      'Cache strategy "update" executed successfully for method "updateSomething"',
    );
  });

  it('should log an error if no strategy is found for the method', async () => {
    const ctx: AspectContext = { methodName: 'unknownMethod' } as AspectContext;

    const errorSpy = jest
      .spyOn((databaseCacheUtil as any).logger, 'error')
      .mockImplementation(() => {});

    await databaseCacheUtil.execute(ctx);

    expect(errorSpy).toHaveBeenCalledWith(
      'No cache aspect strategy found for unknownMethod',
    );
  });

  it('should log an error if a strategy execution fails', async () => {
    const ctx: AspectContext = { methodName: 'findSomething' } as AspectContext;
    const error = new Error('Execution failed');
    (selectStrategy.execute as jest.Mock).mockRejectedValueOnce(error);

    const errorSpy = jest
      .spyOn((databaseCacheUtil as any).logger, 'error')
      .mockImplementation(() => {});

    await databaseCacheUtil.execute(ctx);

    expect(selectStrategy.execute).toHaveBeenCalledWith(cacheManager);
    expect(errorSpy).toHaveBeenCalledWith(
      'Error executing findSomething: Execution failed',
      expect.any(String),
    );
  });
});
