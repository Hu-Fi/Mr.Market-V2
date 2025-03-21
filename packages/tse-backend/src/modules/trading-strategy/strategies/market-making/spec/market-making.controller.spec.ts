import { Test, TestingModule } from '@nestjs/testing';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { MarketMakingController } from '../market-making.controller';
import { MarketMakingStrategy } from '../market-making.strategy';
import { MarketMakingStrategyProfile } from '../market-making.mapper';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyActionDto,
  MarketMakingStrategyDto,
} from '../model/market-making.dto';
import {
  MarketMakingCommandFixture,
  MarketMakingDtoFixture,
} from './market-making.fixtures';

describe('MarketMakingController', () => {
  let controller: MarketMakingController;
  let service: MarketMakingStrategy;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [MarketMakingController],
      providers: [MarketMakingStrategy, MarketMakingStrategyProfile],
    })
      .overrideProvider(MarketMakingStrategy)
      .useValue(mockService)
      .compile();

    controller = module.get<MarketMakingController>(MarketMakingController);
    service = module.get<MarketMakingStrategy>(MarketMakingStrategy);
  });

  describe('createMarketMaking', () => {
    it('should call service.create with the mapped command', async () => {
      const dto: MarketMakingStrategyDto = MarketMakingDtoFixture;
      const command = MarketMakingCommandFixture;
      jest.spyOn(service, 'create').mockImplementation(async () => {});

      await controller.createMarketMakingStrategy(dto);

      expect(service.create).toHaveBeenCalledWith(command);
    });
  });

  describe('pauseMarketMakingStrategy', () => {
    it('should call service.pause with the mapped command', async () => {
      const dto: MarketMakingStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command = dto as MarketMakingStrategyActionCommand;
      jest.spyOn(service, 'pause').mockImplementation(async () => {});

      await controller.pauseMarketMakingStrategy(dto);

      expect(service.pause).toHaveBeenCalledWith(command);
    });
  });

  describe('stopMarketMakingStrategy', () => {
    it('should call service.stop with the mapped command', async () => {
      const dto: MarketMakingStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command = dto as MarketMakingStrategyActionCommand;
      jest.spyOn(service, 'stop').mockImplementation(async () => {});

      await controller.stopMarketMakingStrategy(dto);

      expect(service.stop).toHaveBeenCalledWith(command);
    });
  });

  describe('deleteMarketMakingStrategy', () => {
    it('should call service.delete with the mapped command', async () => {
      const dto: MarketMakingStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command = dto as MarketMakingStrategyActionCommand;
      jest.spyOn(service, 'delete').mockImplementation(async () => {});

      await controller.deleteMarketMakingStrategy(dto);

      expect(service.delete).toHaveBeenCalledWith(command);
    });
  });
});
