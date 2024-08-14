import { Test, TestingModule } from '@nestjs/testing';
import { SnapshotsService } from '../snapshots.service';
import { MixinGateway } from '../../../../integrations/mixin.gateway';
import { StrategyExecutor } from '../../../../common/utils/trading-dispatcher/strategy-executor';
import { SnapshotsRepository } from '../snapshots.repository';
import { CustomLogger } from '../../../logger/logger.service';
import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';

describe('SnapshotsService', () => {
  let service: SnapshotsService;
  let mixinGateway: MixinGateway;
  let strategyExecutor: StrategyExecutor;
  let snapshotsRepository: SnapshotsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotsService,
        {
          provide: MixinGateway,
          useValue: {
            fetchSafeSnapshots: jest.fn(),
          },
        },
        {
          provide: StrategyExecutor,
          useValue: {
            executeStrategy: jest.fn(),
          },
        },
        {
          provide: SnapshotsRepository,
          useValue: {
            checkSnapshotExist: jest.fn(),
            createSnapshot: jest.fn(),
          },
        },
        {
          provide: CustomLogger,
          useValue: {
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SnapshotsService>(SnapshotsService);
    mixinGateway = module.get<MixinGateway>(MixinGateway);
    strategyExecutor = module.get<StrategyExecutor>(StrategyExecutor);
    snapshotsRepository = module.get<SnapshotsRepository>(SnapshotsRepository);
  });

  describe('handleSnapshot', () => {
    it('should return if snapshot already exists', async () => {
      const snapshot: SafeSnapshot = { snapshot_id: '1', memo: 'memo' } as any;
      jest
        .spyOn(snapshotsRepository, 'checkSnapshotExist')
        .mockResolvedValue(true);

      await service.handleSnapshot(snapshot);

      expect(snapshotsRepository.checkSnapshotExist).toHaveBeenCalledWith(
        snapshot.snapshot_id,
      );
      expect(snapshotsRepository.createSnapshot).not.toHaveBeenCalled();
      expect(strategyExecutor.executeStrategy).not.toHaveBeenCalled();
    });

    it('should create snapshot if memo is missing or empty', async () => {
      const snapshot: SafeSnapshot = { snapshot_id: '1', memo: '' } as any;
      jest
        .spyOn(snapshotsRepository, 'checkSnapshotExist')
        .mockResolvedValue(false);

      await service.handleSnapshot(snapshot);

      expect(snapshotsRepository.createSnapshot).toHaveBeenCalledWith(snapshot);
      expect(strategyExecutor.executeStrategy).not.toHaveBeenCalled();
    });

    it('should execute strategy and create snapshot if memo is valid', async () => {
      const originalMemo = 'SP:LB:01:dest123:5000:ref123';
      const base64Memo = Buffer.from(originalMemo, 'utf-8').toString('base64');
      const hexMemo = Buffer.from(base64Memo, 'utf-8').toString('hex');

      const snapshot: SafeSnapshot = { snapshot_id: '1', memo: hexMemo } as any;
      jest
        .spyOn(snapshotsRepository, 'checkSnapshotExist')
        .mockResolvedValue(false);

      await service.handleSnapshot(snapshot);

      expect(strategyExecutor.executeStrategy).toHaveBeenCalledWith(
        'SP',
        originalMemo,
        snapshot,
      );
      expect(snapshotsRepository.createSnapshot).toHaveBeenCalledWith(snapshot);
    });

    it('should correctly handle corrupted memo', async () => {
      const corruptedHexMemo = 'invalidhexstring';
      const snapshot: SafeSnapshot = {
        snapshot_id: '1',
        memo: corruptedHexMemo,
      } as any;
      jest
        .spyOn(snapshotsRepository, 'checkSnapshotExist')
        .mockResolvedValue(false);

      await expect(service.handleSnapshot(snapshot)).resolves.not.toThrow();

      expect(snapshotsRepository.createSnapshot).toHaveBeenCalledWith(snapshot);
      expect(strategyExecutor.executeStrategy).not.toHaveBeenCalled();
    });
  });

  describe('fetchAndProcessSnapshots', () => {
    it('should fetch snapshots and process them', async () => {
      const snapshots: SafeSnapshot[] = [
        { snapshot_id: '1', memo: 'memo1' } as any,
        { snapshot_id: '2', memo: 'memo2' } as any,
      ];
      jest
        .spyOn(mixinGateway, 'fetchSafeSnapshots')
        .mockResolvedValue(snapshots);
      jest.spyOn(service, 'handleSnapshot').mockImplementation(jest.fn());

      await service.fetchAndProcessSnapshots();

      expect(mixinGateway.fetchSafeSnapshots).toHaveBeenCalled();
      expect(service.handleSnapshot).toHaveBeenCalledTimes(2);
      expect(service.handleSnapshot).toHaveBeenCalledWith(snapshots[0]);
      expect(service.handleSnapshot).toHaveBeenCalledWith(snapshots[1]);
    });

    it('should handle empty snapshots list', async () => {
      jest.spyOn(mixinGateway, 'fetchSafeSnapshots').mockResolvedValue([]);
      jest.spyOn(service, 'handleSnapshot');

      await service.fetchAndProcessSnapshots();

      expect(mixinGateway.fetchSafeSnapshots).toHaveBeenCalled();
      expect(service.handleSnapshot).not.toHaveBeenCalled();
    });
  });

  describe('handleSnapshots', () => {
    it('should call fetchAndProcessSnapshots on cron job', async () => {
      jest
        .spyOn(service, 'fetchAndProcessSnapshots')
        .mockImplementation(jest.fn());

      await service.handleSnapshots();

      expect(service.fetchAndProcessSnapshots).toHaveBeenCalled();
    });
  });
});
