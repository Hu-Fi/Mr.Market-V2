import { Test, TestingModule } from '@nestjs/testing';
import { UserBalanceService } from '../user-balance.service';
import { UserBalanceRepository } from '../user-balance.repository';
import { UserBalance } from '../../../common/entities/user-balance.entity';

const mockUserBalanceRepository = {
  findByUserIdAssetId: jest.fn(),
  saveUserBalance: jest.fn(),
};

describe('UserBalanceService', () => {
  let service: UserBalanceService;
  let repository: UserBalanceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserBalanceService,
        {
          provide: UserBalanceRepository,
          useValue: mockUserBalanceRepository,
        },
      ],
    }).compile();

    service = module.get<UserBalanceService>(UserBalanceService);
    repository = module.get<UserBalanceRepository>(UserBalanceRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find or create a user balance', async () => {
    const userBalance = {
      userId: '1',
      assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
      balance: 0,
    } as UserBalance;

    jest.spyOn(repository, 'findByUserIdAssetId').mockResolvedValue(null);
    jest.spyOn(repository, 'saveUserBalance').mockResolvedValue(userBalance);

    const result = await service.findOrCreateUserBalance(
      '1',
      '43d61dcd-e413-450d-80b8-101d5e903357',
    );
    expect(result).toEqual(userBalance);
    expect(repository.findByUserIdAssetId).toHaveBeenCalledWith(
      '1',
      '43d61dcd-e413-450d-80b8-101d5e903357',
    );
    expect(repository.saveUserBalance).toHaveBeenCalledWith(
      expect.any(UserBalance),
    );
  });

  it('should update user balance on deposit', async () => {
    const userBalance = {
      userId: '1',
      assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
      balance: 100,
    } as UserBalance;

    jest
      .spyOn(repository, 'findByUserIdAssetId')
      .mockResolvedValue(userBalance);
    jest.spyOn(repository, 'saveUserBalance').mockResolvedValue({
      ...userBalance,
      balance: 200,
    });

    const result = await service.updateUserBalance({
      userId: '1',
      assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
      amount: 100,
    });
    expect(result.balance).toEqual(200);
    expect(repository.saveUserBalance).toHaveBeenCalledWith({
      ...userBalance,
      balance: 200,
    });
  });

  it('should throw an error for insufficient balance on withdrawal', async () => {
    const userBalance = {
      userId: '1',
      assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
      balance: 50,
    } as UserBalance;

    jest
      .spyOn(repository, 'findByUserIdAssetId')
      .mockResolvedValue(userBalance);

    await expect(
      service.updateUserBalance({
        userId: '1',
        assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
        amount: -100,
      }),
    ).rejects.toThrow('Insufficient balance');
  });
});
