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
import {
  ArbitrageCommandFixture,
  ArbitrageDtoFixture,
} from './arbitrage.fixtures';
import { Decimal } from 'decimal.js';
import { RequestWithUser } from '../../../../../common/interfaces/http-request.interfaces';

describe('ArbitrageController', () => {
  let controller: ArbitrageController;
  let service: ArbitrageStrategy;

  const mockRequest = {
    user: {
      userId: 'user-123',
      clientId: 'client-456',
    },
  } as RequestWithUser;

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
    it('should call service.create with the correctly mapped command', async () => {
      const dto: ArbitrageStrategyDto = ArbitrageDtoFixture;
      const expectedCommand: ArbitrageStrategyCommand = {
        ...ArbitrageCommandFixture,
        amountToTrade: new Decimal(dto.amountToTrade),
        userId: mockRequest.user.userId,
        clientId: mockRequest.user.clientId,
      };

      jest.spyOn(service, 'create').mockResolvedValue();

      await controller.createArbitrage(mockRequest, dto);

      expect(service.create).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('pauseArbitrage', () => {
    it('should call service.pause with the correctly mapped command', async () => {
      const dto: ArbitrageStrategyActionDto = { id: 1 };
      const expectedCommand: ArbitrageStrategyActionCommand = {
        id: 1,
        userId: mockRequest.user.userId,
        clientId: mockRequest.user.clientId,
      };

      jest.spyOn(service, 'pause').mockResolvedValue();

      await controller.pauseArbitrage(mockRequest, dto);

      expect(service.pause).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('stopArbitrage', () => {
    it('should call service.stop with the correctly mapped command', async () => {
      const dto: ArbitrageStrategyActionDto = { id: 2 };
      const expectedCommand: ArbitrageStrategyActionCommand = {
        id: 2,
        userId: mockRequest.user.userId,
        clientId: mockRequest.user.clientId,
      };

      jest.spyOn(service, 'stop').mockResolvedValue();

      await controller.stopArbitrage(mockRequest, dto);

      expect(service.stop).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('deleteArbitrage', () => {
    it('should call service.delete with the correctly mapped command', async () => {
      const dto: ArbitrageStrategyActionDto = { id: 3 };
      const expectedCommand: ArbitrageStrategyActionCommand = {
        id: 3,
        userId: mockRequest.user.userId,
        clientId: mockRequest.user.clientId,
      };

      jest.spyOn(service, 'delete').mockResolvedValue();

      await controller.deleteArbitrage(mockRequest, dto);

      expect(service.delete).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
