import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DepositRepository } from '../deposit.repository';
import { Deposit } from '../../../common/entities/deposit.entity';
import { Status } from '../../../common/enums/deposit.enum';

const mockRepository = {
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('DepositRepository', () => {
  let depositRepository: DepositRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositRepository,
        {
          provide: getRepositoryToken(Deposit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    depositRepository = module.get<DepositRepository>(DepositRepository);
  });

  it('should be defined', () => {
    expect(depositRepository).toBeDefined();
  });

  describe('save', () => {
    it('should save a deposit and return it', async () => {
      const transactionData = { userId: 'user-123', amount: 100, assetId: 'asset-456', status: Status.PENDING, chainId: 'chainId-123', destination: 'dest-123' };
      const savedDeposit = { id: 1, ...transactionData };

      mockRepository.save.mockResolvedValue(savedDeposit);

      const result = await depositRepository.save(transactionData);

      expect(mockRepository.save).toHaveBeenCalledWith(transactionData);
      expect(result).toEqual(savedDeposit);
    });
  });

  describe('getByStatus', () => {
    it('should return deposits with the specified status', async () => {
      const status = Status.PENDING;
      const deposits = [{ id: 1, userId: 'user-123', amount: 100, assetId: 'asset-456', status }];

      mockRepository.find.mockResolvedValue(deposits);

      const result = await depositRepository.getByStatus(status);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { status } });
      expect(result).toEqual(deposits);
    });
  });

  describe('update', () => {
    it('should update the status of a deposit', async () => {
      const depositId = 1;
      const status = Status.CONFIRMED;

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await depositRepository.update(depositId, status);

      expect(mockRepository.update).toHaveBeenCalledWith({ id: depositId }, { status });
      expect(result).toEqual({ affected: 1 });
    });
  });
});
