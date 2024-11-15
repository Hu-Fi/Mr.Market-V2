import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import {
  BalanceDetail,
  UserBalanceResponse,
} from '../../../common/interfaces/mixin.interfaces';
import { JwtAuthGuard } from '../../../common/utils/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/utils/auth/guards/roles.guard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getMixinUserBalance: jest.fn().mockResolvedValue({
              balances: [
                {
                  asset: 'BTC',
                  symbol: 'BTC',
                  balance: '0.01',
                  balanceUSD: '200',
                  balanceBTC: '0.01',
                },
                {
                  asset: 'ETH',
                  symbol: 'ETH',
                  balance: '0.5',
                  balanceUSD: '900',
                  balanceBTC: '0.02',
                },
              ] as BalanceDetail[],
              totalUSDBalance: '1100',
              totalBTCBalance: '0.03',
            } as UserBalanceResponse),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user balance', async () => {
    const req = { user: { userId: 'test-user-id' } };
    const result = await controller.getBalance(req);
    expect(result).toEqual({
      balances: [
        {
          asset: 'BTC',
          symbol: 'BTC',
          balance: '0.01',
          balanceUSD: '200',
          balanceBTC: '0.01',
        },
        {
          asset: 'ETH',
          symbol: 'ETH',
          balance: '0.5',
          balanceUSD: '900',
          balanceBTC: '0.02',
        },
      ],
      totalUSDBalance: '1100',
      totalBTCBalance: '0.03',
    });
    expect(service.getMixinUserBalance).toHaveBeenCalledWith('test-user-id');
  });
});
