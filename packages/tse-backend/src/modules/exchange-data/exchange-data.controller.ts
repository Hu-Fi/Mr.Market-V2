import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ExchangeDataService } from './exchange-data.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetMultipleTickerPricesCommand,
  GetMultipleTickerPricesDto,
  GetOHLCVCommand,
  GetOHLCVDto,
  GetSupportedSymbolsCommand,
  GetSupportedSymbolsDto,
  GetTickerPriceCommand,
  GetTickerPriceDto,
  GetTickersCommand,
  GetTickersDto,
} from './model/exchange-data.model';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';

@ApiTags('exchange data service')
@UsePipes(new ValidationPipe())
@Controller('exchange-data')
export class ExchangeDataController {
  constructor(
    private readonly exchangeDataService: ExchangeDataService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Get('/tickers')
  @ApiOperation({ summary: 'Get tickers' })
  @UsePipes(new ValidationPipe())
  async getTickers(@Query() query: GetTickersDto) {
    const command = this.mapper.map(query, GetTickersDto, GetTickersCommand);
    return this.exchangeDataService.getTickers(command);
  }

  @Get('/ohlcv')
  @ApiOperation({ summary: 'Get OHLCV data' })
  async getOHLCV(@Query() query: GetOHLCVDto) {
    const command = this.mapper.map(query, GetOHLCVDto, GetOHLCVCommand);
    return this.exchangeDataService.getOHLCVData(command);
  }

  @Get('/tickers/pairs')
  @ApiOperation({ summary: 'Get supported pairs' })
  async getSupportedPairs() {
    const supportedExchanges = await this.exchangeDataService.getSupportedExchanges();
    if (!supportedExchanges.length) {
      throw new Error('No supported exchanges found');
    }
    const supportedPairs: string[] = [];
    for (const exchange of supportedExchanges) {
      const pairs = await this.exchangeDataService.getSupportedPairs(exchange);
      supportedPairs.push(...pairs);
    }
    return supportedPairs;
  }

  @Get('/tickers/price')
  @ApiOperation({ summary: 'Get ticker price' })
  async getTickerPrice(@Query() query: GetTickerPriceDto) {
    const command = this.mapper.map(
      query,
      GetTickerPriceDto,
      GetTickerPriceCommand,
    );
    return this.exchangeDataService.getTickerPrice(command);
  }

  @Get('/tickers/multiple')
  @ApiOperation({ summary: 'Get multiple ticker prices' })
  async getMultipleTickerPrices(@Query() query: GetMultipleTickerPricesDto) {
    const command = this.mapper.map(
      query,
      GetMultipleTickerPricesDto,
      GetMultipleTickerPricesCommand,
    );
    return this.exchangeDataService.getMultipleTickerPrices(command);
  }

  @Get('/tickers/symbols')
  @ApiOperation({ summary: 'Get supported symbols' })
  async getSupportedSymbols(@Query() query: GetSupportedSymbolsDto) {
    const command = this.mapper.map(
      query,
      GetSupportedSymbolsDto,
      GetSupportedSymbolsCommand,
    );
    return this.exchangeDataService.getSupportedSymbols(command);
  }
}
