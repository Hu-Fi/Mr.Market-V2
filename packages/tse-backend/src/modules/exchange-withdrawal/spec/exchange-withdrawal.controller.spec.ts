import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeWithdrawalController } from '../exchange-withdrawal.controller';
import { ExchangeWithdrawalService } from '../exchange-withdrawal.service';
import { AutomapperModule, InjectMapper } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import {
  CreateWithdrawalCommand,
  CreateWithdrawalDto,
} from '../model/exchange-withdrawal.model';
import { Decimal } from 'decimal.js';
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core';
import { AutomapperProfile } from '@automapper/nestjs';

export class WithdrawalMappingTestProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      createMap(
        mapper,
        CreateWithdrawalDto,
        CreateWithdrawalCommand,
        forMember(
          (dest) => dest.amount,
          mapFrom((src) => new Decimal(src.amount)),
        ),
      );
    };
  }
}

describe('ExchangeWithdrawalController', () => {
  let controller: ExchangeWithdrawalController;
  let service: ExchangeWithdrawalService;

  const mockExchangeWithdrawalService = {
    handleWithdrawal: jest.fn(),
  };

  const createWithdrawalDtoFixture: CreateWithdrawalDto = {
    userId: '',
    exchangeName: 'binance',
    symbol: 'ETH',
    network: 'eth',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    tag: 'tag',
    amount: '1.5',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeWithdrawalController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: ExchangeWithdrawalService,
          useValue: mockExchangeWithdrawalService,
        },
        WithdrawalMappingTestProfile,
      ],
    }).compile();

    controller = module.get<ExchangeWithdrawalController>(
      ExchangeWithdrawalController,
    );
    service = module.get<ExchangeWithdrawalService>(ExchangeWithdrawalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWithdrawal', () => {
    it('should call handleWithdrawal with correct command', async () => {
      await controller.createWithdrawal(createWithdrawalDtoFixture);
      expect(service.handleWithdrawal).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: createWithdrawalDtoFixture.userId,
          exchangeName: createWithdrawalDtoFixture.exchangeName,
          symbol: createWithdrawalDtoFixture.symbol,
          network: createWithdrawalDtoFixture.network,
          address: createWithdrawalDtoFixture.address,
          tag: createWithdrawalDtoFixture.tag,
          amount: expect.any(Decimal),
        }),
      );
    });
  });
});
