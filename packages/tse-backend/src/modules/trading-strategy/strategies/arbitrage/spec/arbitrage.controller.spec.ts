import { Test, TestingModule } from '@nestjs/testing';
import { ArbitrageStrategy } from '../arbitrage.strategy';
import { ArbitrageController } from '../arbitrage.controller';
import {
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
  ArbitrageStrategyCommand,
  ArbitrageStrategyDto,
} from '../model/arbitrage.dto';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { ArbitrageStrategyProfile } from '../arbitrage.mapper';
import { ArbitrageCommandFixture, ArbitrageDtoFixture } from './arbitrage.fixtures';

describe('ArbitrageController', () => {
  let controller: ArbitrageController;
  let service: ArbitrageStrategy;

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
      controllers: [ArbitrageController],
      providers: [ArbitrageStrategy, ArbitrageStrategyProfile],
    })
      .overrideProvider(ArbitrageStrategy)
      .useValue(mockService)
      .compile();

    controller = module.get<ArbitrageController>(ArbitrageController);
    service = module.get<ArbitrageStrategy>(ArbitrageStrategy);
  });

  describe('createArbitrage', () => {
    it('should call service.create with the mapped command', async () => {
      const dto: ArbitrageStrategyDto = ArbitrageDtoFixture;
      const command: ArbitrageStrategyCommand = ArbitrageCommandFixture;
      jest.spyOn(service, 'create').mockImplementation(async () => {});

      await controller.createArbitrage(dto);

      expect(service.create).toHaveBeenCalledWith(command);
    });
  });

  describe('pauseArbitrage', () => {
    it('should call service.pause with the mapped command', async () => {
      const dto: ArbitrageStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command = dto as ArbitrageStrategyActionCommand;
      jest.spyOn(service, 'pause').mockImplementation(async () => {});

      await controller.pauseArbitrage(dto);

      expect(service.pause).toHaveBeenCalledWith(command);
    });
  });

  describe('stopArbitrage', () => {
    it('should call service.stop with the mapped command', async () => {
      const dto: ArbitrageStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command = dto as ArbitrageStrategyActionCommand;
      jest.spyOn(service, 'stop').mockImplementation(async () => {});

      await controller.stopArbitrage(dto);

      expect(service.stop).toHaveBeenCalledWith(command);
    });
  });

  describe('deleteArbitrage', () => {
    it('should call service.delete with the mapped command', async () => {
      const dto: ArbitrageStrategyActionDto = {
        userId: '123',
        clientId: '456',
      };
      const command = dto as ArbitrageStrategyActionCommand;
      jest.spyOn(service, 'delete').mockImplementation(async () => {});

      await controller.deleteArbitrage(dto);

      expect(service.delete).toHaveBeenCalledWith(command);
    });
  });
});
