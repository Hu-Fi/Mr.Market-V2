import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsString, IsNumber, IsEnum } from 'class-validator';
import { TradeSideType } from '../../../common/enums/exchange-operation.enums';
import { Decimal } from 'decimal.js';

export class MarketTradeDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  exchange: string;

  @AutoMap()
  @ApiProperty({ example: 'BTC/USDT' })
  @IsString()
  symbol: string;

  @AutoMap()
  @ApiProperty({
    example: 'buy',
    enum: TradeSideType,
  })
  @IsEnum(TradeSideType)
  side: TradeSideType;

  @AutoMap()
  @ApiProperty({
    example: '0.001',
    description: 'The amount of the asset to trade.',
  })
  @IsString()
  amount: string;
}

export class MarketLimitDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  exchange: string;

  @AutoMap()
  @ApiProperty({ example: 'BTC/USDT' })
  @IsString()
  symbol: string;

  @AutoMap()
  @ApiProperty({
    example: 'buy',
    enum: TradeSideType,
  })
  @IsEnum(TradeSideType)
  side: TradeSideType;

  @AutoMap()
  @ApiProperty({
    example: '0.001',
    description: 'The amount of the asset to trade.',
  })
  @IsString()
  amount: string;

  @AutoMap()
  @ApiProperty()
  @IsNumber()
  price: number;
}

export class MarketTradeCommand {
  @AutoMap()
  userId: string;

  @AutoMap()
  clientId: string;

  @AutoMap()
  exchange: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  side: string;

  @AutoMap()
  amount: Decimal;
}

export class MarketLimitCommand {
  @AutoMap()
  userId: string;

  @AutoMap()
  clientId: string;

  @AutoMap()
  exchange: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  side: string;

  @AutoMap()
  amount: Decimal;

  @AutoMap()
  price: number;
}

export type MarketTrade = MarketLimitCommand | MarketTradeCommand;

export class CancelOrderDto {
  @AutoMap()
  @ApiProperty({ example: 'bybit' })
  @IsString()
  exchange: string;

  @AutoMap()
  @ApiProperty({ example: '1' })
  @IsString()
  orderId: string;

  @AutoMap()
  @ApiProperty({ example: 'BTC/USDT' })
  @IsString()
  symbol: string;
}

export class CancelOrderCommand {
  userId: string;
  clientId: string;

  @AutoMap()
  exchange: string;

  @AutoMap()
  orderId: string;

  @AutoMap()
  symbol: string;
}
