import { Test, TestingModule } from '@nestjs/testing';
import { TradingStrategyController } from '../trading-strategy.controller';
import { StrategyExecutorService } from '../strategy-executor.service';
import {
  ArbitrageStrategyDto,
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
} from '../strategies/arbitrage/model/arbitrage.dto';
import { StrategyTypeEnums } from '../../../common/enums/strategy-type.enums';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { TradingStrategyProfile } from '../trading-strategy.mapper';

describe('TradingStrategyController', () => {
  let controller: TradingStrategyController;
  let service: StrategyExecutorService;

  const mockStrategyExecutorService = {
    startArbitrageStrategyForUser: jest.fn(),
    pauseArbitrageStrategyForUser: jest.fn(),
    stopArbitrageStrategyForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradingStrategyController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [StrategyExecutorService, TradingStrategyProfile],
    })
      .overrideProvider(StrategyExecutorService)
      .useValue(mockStrategyExecutorService)
      .compile();

    controller = module.get<TradingStrategyController>(
      TradingStrategyController,
    );
    service = module.get<StrategyExecutorService>(StrategyExecutorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('executeArbitrage', () => {
    it('should call startArbitrageStrategyForUser method of the service with correct arguments', async () => {
      const dto: ArbitrageStrategyDto = {
        userId: '123',
        clientId: '456',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'binance',
        exchangeBName: 'mexc',
      };
      const command = { ...dto };
      await controller.executeArbitrage(dto);

      expect(service.startArbitrageStrategyForUser).toHaveBeenCalledWith(
        command,
      );
    });
  });

  describe('pauseArbitrage', () => {
    it('should call pauseArbitrageStrategyForUser method of the service with correct arguments', async () => {
      const dto: ArbitrageStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command: ArbitrageStrategyActionCommand = {
        ...dto,
        arbitrage: StrategyTypeEnums.ARBITRAGE,
      };
      await controller.pauseArbitrage(dto);

      expect(
        mockStrategyExecutorService.pauseArbitrageStrategyForUser,
      ).toHaveBeenCalledWith(command);
    });
  });

  describe('stopArbitrage', () => {
    it('should call stopArbitrageStrategyForUser method of the service with correct arguments', async () => {
      const dto: ArbitrageStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command: ArbitrageStrategyActionCommand = {
        ...dto,
        arbitrage: StrategyTypeEnums.ARBITRAGE,
      };
      await controller.stopArbitrage(dto);

      expect(
        mockStrategyExecutorService.stopArbitrageStrategyForUser,
      ).toHaveBeenCalledWith(command);
    });
  });
});
