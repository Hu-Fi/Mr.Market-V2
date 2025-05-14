import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeDepositController } from '../exchange-deposit.controller';
import { ExchangeDepositService } from '../exchange-deposit.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from '../model/exchange-deposit.model';
import { ExchangeDepositProfile } from '../exchange-deposit.mapper';
import { ExchangeNetwork } from '../../../common/enums/exchange-data.enums';
import { Decimal } from 'decimal.js';
import { RequestWithUser } from '../../../common/interfaces/http-request.interfaces';

describe('ExchangeDepositController', () => {
  let controller: ExchangeDepositController;
  let service: ExchangeDepositService;

  const mockExchangeDepositService = {
    handleDeposit: jest.fn(),
  };

  const createDepositDtoFixture: CreateDepositDto = {
    amount: '100',
    exchangeName: 'binance',
    symbol: 'ETH',
    network: ExchangeNetwork.ERC20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeDepositController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: ExchangeDepositService,
          useValue: mockExchangeDepositService,
        },
        ExchangeDepositProfile,
      ],
    }).compile();

    controller = module.get<ExchangeDepositController>(
      ExchangeDepositController,
    );
    service = module.get<ExchangeDepositService>(ExchangeDepositService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDepositAddress', () => {
    it('should call handleDeposit with correct command', async () => {
      const command: CreateDepositCommand = {
        userId: 'userId',
        amount: new Decimal(100),
        exchangeName: createDepositDtoFixture.exchangeName,
        symbol: createDepositDtoFixture.symbol,
        network: createDepositDtoFixture.network,
      };

      const req = {
        user: {
          userId: 'userId',
          clientId: 'clientId',
        },
      } as RequestWithUser;

      await controller.createDepositAddress(createDepositDtoFixture, req);
      expect(service.handleDeposit).toHaveBeenCalledWith(command);
    });
  });
});
