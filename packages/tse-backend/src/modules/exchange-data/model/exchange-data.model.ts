import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTickersDto {
  @AutoMap()
  @ApiProperty({ example: 'binance' })
  @IsString()
  exchange: string;

  @AutoMap()
  @ApiProperty({ example: ['ETH/USDT', 'BTC/USDT'], type: [String] })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  symbols: string[];
}

export class GetOHLCVDto {
  @AutoMap()
  @ApiProperty({ example: 'binance' })
  @IsString()
  exchange: string;

  @AutoMap()
  @ApiProperty({ example: 'ETH/USDT' })
  @IsString()
  symbol: string;

  @AutoMap()
  @ApiProperty({ example: '1d', required: false })
  @IsOptional()
  @IsString()
  timeframe?: string;

  @AutoMap()
  @ApiProperty({ example: '1609459200000', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  since?: number;

  @AutoMap()
  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit?: number;
}

export class GetTickerPriceDto {
  @AutoMap()
  @ApiProperty({ example: 'binance' })
  @IsString()
  exchange: string;

  @AutoMap()
  @ApiProperty({ example: 'ETH/USDT' })
  @IsString()
  symbol: string;
}

export class GetMultipleTickerPricesDto {
  @AutoMap()
  @ApiProperty({ example: ['binance', 'gate'], type: [String] })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  exchangeNames: string[];

  @AutoMap()
  @ApiProperty({ example: ['ETH/USDT', 'BTC/USDT'], type: [String] })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  symbols: string[];
}

export class GetSupportedSymbolsDto {
  @AutoMap()
  @ApiProperty({ example: 'binance' })
  @IsString()
  exchange: string;
}

export class GetTickersCommand {
  @AutoMap()
  exchange: string;

  @AutoMap()
  symbols: string[];
}

export class GetOHLCVCommand {
  @AutoMap()
  exchange: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  timeframe?: string;

  @AutoMap()
  since?: number;

  @AutoMap()
  limit?: number;
}

export class GetTickerPriceCommand {
  @AutoMap()
  exchange: string;

  @AutoMap()
  symbol: string;

  constructor(exchange: string, symbol: string) {
    this.exchange = exchange;
    this.symbol = symbol;
  }
}

export class GetMultipleTickerPricesCommand {
  @AutoMap()
  exchangeNames: string[];

  @AutoMap()
  symbols: string[];
}

export class GetSupportedSymbolsCommand {
  @AutoMap()
  exchange: string;
}
