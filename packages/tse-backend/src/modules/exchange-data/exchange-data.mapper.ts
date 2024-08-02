import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
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

@Injectable()
export class ExchangeDataProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        GetTickersDto,
        GetTickersCommand,
        forMember(
          (destination) => destination.exchange,
          mapFrom((source) => source.exchange.toLowerCase()),
        ),
        forMember(
          (destination) => destination.symbols,
          mapFrom((source) =>
            source.symbols.map((symbol) => symbol.toUpperCase())
          ),
        ),
      );
      createMap(
        mapper,
        GetOHLCVDto,
        GetOHLCVCommand,
        forMember(
          (destination) => destination.exchange,
          mapFrom((source) => source.exchange.toLowerCase()),
        ),
        forMember(
          (destination) => destination.symbol,
          mapFrom((source) => source.symbol.toUpperCase()),
        ),
      );
      createMap(
        mapper,
        GetTickerPriceDto,
        GetTickerPriceCommand,
        forMember(
          (destination) => destination.exchange,
          mapFrom((source) => source.exchange.toLowerCase()),
        ),
        forMember(
          (destination) => destination.symbol,
          mapFrom((source) => source.symbol.toUpperCase()),
        ),
      );
      createMap(
        mapper,
        GetMultipleTickerPricesDto,
        GetMultipleTickerPricesCommand,
        forMember(
          (destination) => destination.exchangeNames,
          mapFrom((source) =>
            source.exchangeNames.map((exchangeName) => exchangeName.toLowerCase())
          ),
        ),
        forMember(
          (destination) => destination.symbols,
          mapFrom((source) =>
            source.symbols.map((symbol) => symbol.toUpperCase())
          ),
        ),
      );
      createMap(
        mapper,
        GetSupportedSymbolsDto,
        GetSupportedSymbolsCommand,
        forMember(
          (destination) => destination.exchange,
          mapFrom((source) => source.exchange.toLowerCase()),
        ),
      );
    };
  }
}
