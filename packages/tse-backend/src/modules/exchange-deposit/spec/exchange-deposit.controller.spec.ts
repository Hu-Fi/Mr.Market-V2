import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeDepositController } from '../exchange-deposit.controller';
import { ExchangeDepositService } from '../exchange-deposit.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import {
  CreateDepositDto,
  CreateDepositCommand,
} from '../model/exchange-deposit.model';
import { ExchangeDepositProfile } from '../exchange-deposit.mapper';

describe('ExchangeDepositController', () => {
  let controller: ExchangeDepositController;
  let service: ExchangeDepositService;

  const mockExchangeDepositService = {
    handleDeposit: jest.fn(),
  };

  const createDepositDtoFixture: CreateDepositDto = {
    userId: '',
    exchangeName: 'binance',
    symbol: 'ETH',
    network: 'eth',
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
        userId: createDepositDtoFixture.userId,
        exchangeName: createDepositDtoFixture.exchangeName,
        symbol: createDepositDtoFixture.symbol,
        network: createDepositDtoFixture.network,
      };

      await controller.createDepositAddress(createDepositDtoFixture);
      expect(service.handleDeposit).toHaveBeenCalledWith(command);
    });
  });
});
