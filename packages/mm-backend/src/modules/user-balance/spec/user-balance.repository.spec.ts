import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalanceRepository } from '../user-balance.repository';
import { UserBalance } from '../../../common/entities/user-balance.entity';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

describe('UserBalanceRepository', () => {
  let userBalanceRepository: UserBalanceRepository;
  let repository: Repository<UserBalance>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserBalanceRepository,
        {
          provide: getRepositoryToken(UserBalance),
          useValue: mockRepository,
        },
      ],
    }).compile();

    userBalanceRepository = module.get<UserBalanceRepository>(UserBalanceRepository);
    repository = module.get<Repository<UserBalance>>(getRepositoryToken(UserBalance));
  });

  it('should be defined', () => {
    expect(userBalanceRepository).toBeDefined();
  });

  it('should find a user balance by userId, exchange, and currency', async () => {
    const userBalance = { userId: '1', exchange: 'binance', currency: 'USD' } as UserBalance;
    jest.spyOn(repository, 'findOne').mockResolvedValue(userBalance);

    const result = await userBalanceRepository.findByUserIdExchangeCurrency('1', 'binance', 'USD');
    expect(result).toEqual(userBalance);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { userId: '1', exchange: 'binance', currency: 'USD' },
    });
  });

  it('should save a user balance', async () => {
    const userBalance = { userId: '1', exchange: 'binance', currency: 'USD', balance: 100 } as UserBalance;
    jest.spyOn(repository, 'save').mockResolvedValue(userBalance);

    const result = await userBalanceRepository.saveUserBalance(userBalance);
    expect(result).toEqual(userBalance);
    expect(repository.save).toHaveBeenCalledWith(userBalance);
  });
});
