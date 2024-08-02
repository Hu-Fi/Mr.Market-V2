import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeDataController } from '../exchange-data.controller';
import { ExchangeDataService } from '../exchange-data.service';
import {
  GetTickersDto,
  GetOHLCVDto,
  GetTickerPriceDto,
  GetMultipleTickerPricesDto,
  GetSupportedSymbolsDto,
  GetTickersCommand,
  GetOHLCVCommand,
  GetTickerPriceCommand,
  GetMultipleTickerPricesCommand,
  GetSupportedSymbolsCommand,
} from '../model/exchange-data.model';
import { ExchangeDataProfile } from '../exchange-data.mapper';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';

describe('ExchangeDataController', () => {
  let controller: ExchangeDataController;
  let service: ExchangeDataService;

  const mockExchangeDataService = {
    getTickers: jest.fn(),
    getOHLCVData: jest.fn(),
    getSupportedPairs: jest.fn(),
    getTickerPrice: jest.fn(),
    getMultipleTickerPrices: jest.fn(),
    getSupportedSymbols: jest.fn(),
  };

  const getTickersDtoFixture: GetTickersDto = {
    exchange: 'binance',
    symbols: ['ETH/USDT'],
  };
  const getTickersCommandFixture: GetTickersCommand = {
    exchange: 'binance',
    symbols: ['ETH/USDT'],
  };

  const getOHLCVDtoFixture: GetOHLCVDto = {
    exchange: 'binance',
    symbol: 'ETH/USDT',
  };
  const getOHLCVCommandFixture: GetOHLCVCommand = {
    exchange: 'binance',
    symbol: 'ETH/USDT',
  };

  const getTickerPriceDtoFixture: GetTickerPriceDto = {
    exchange: 'binance',
    symbol: 'ETH/USDT',
  };
  const getTickerPriceCommandFixture: GetTickerPriceCommand = {
    exchange: 'binance',
    symbol: 'ETH/USDT',
  };

  const getMultipleTickerPricesDtoFixture: GetMultipleTickerPricesDto = {
    exchangeNames: ['binance', 'gate'],
    symbols: ['ETH/USDT', 'BTC/USDT'],
  };
  const getMultipleTickerPricesCommandFixture: GetMultipleTickerPricesCommand =
    {
      exchangeNames: ['binance', 'gate'],
      symbols: ['ETH/USDT', 'BTC/USDT'],
    };

  const getSupportedSymbolsDtoFixture: GetSupportedSymbolsDto = {
    exchange: 'binance',
  };
  const getSupportedSymbolsCommandFixture: GetSupportedSymbolsCommand = {
    exchange: 'binance',
  };

  const getTickersCommandFixtureDifferent: GetTickersCommand = {
    exchange: 'gate',
    symbols: ['BTC/USDT'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeDataController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [ExchangeDataService, ExchangeDataProfile],
    })
      .overrideProvider(ExchangeDataService)
      .useValue(mockExchangeDataService)
      .compile();

    controller = module.get<ExchangeDataController>(ExchangeDataController);
    service = module.get<ExchangeDataService>(ExchangeDataService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTickers', () => {
    it('should call getTickers method of the service with correct arguments', async () => {
      await controller.getTickers(getTickersDtoFixture);
      expect(service.getTickers).toHaveBeenCalledWith(getTickersCommandFixture);
    });
  });

  it('should detect incorrect mapping', async () => {
    jest.spyOn(service, 'getTickers');
    await controller.getTickers(getTickersDtoFixture);
    expect(service.getTickers).not.toHaveBeenCalledWith(
      getTickersCommandFixtureDifferent,
    );
  });

  describe('getOHLCV', () => {
    it('should call getOHLCVData method of the service with correct arguments', async () => {
      await controller.getOHLCV(getOHLCVDtoFixture);
      expect(service.getOHLCVData).toHaveBeenCalledWith(getOHLCVCommandFixture);
    });
  });

  describe('getSupportedPairs', () => {
    it('should call getSupportedPairs method of the service', async () => {
      await controller.getSupportedPairs();
      expect(service.getSupportedPairs).toHaveBeenCalled();
    });
  });

  describe('getTickerPrice', () => {
    it('should call getTickerPrice method of the service with correct arguments', async () => {
      await controller.getTickerPrice(getTickerPriceDtoFixture);
      expect(service.getTickerPrice).toHaveBeenCalledWith(
        getTickerPriceCommandFixture,
      );
    });
  });

  describe('getMultipleTickerPrices', () => {
    it('should call getMultipleTickerPrices method of the service with correct arguments', async () => {
      await controller.getMultipleTickerPrices(
        getMultipleTickerPricesDtoFixture,
      );
      expect(service.getMultipleTickerPrices).toHaveBeenCalledWith(
        getMultipleTickerPricesCommandFixture,
      );
    });
  });

  describe('getSupportedSymbols', () => {
    it('should call getSupportedSymbols method of the service with correct arguments', async () => {
      await controller.getSupportedSymbols(getSupportedSymbolsDtoFixture);
      expect(service.getSupportedSymbols).toHaveBeenCalledWith(
        getSupportedSymbolsCommandFixture,
      );
    });
  });
});
