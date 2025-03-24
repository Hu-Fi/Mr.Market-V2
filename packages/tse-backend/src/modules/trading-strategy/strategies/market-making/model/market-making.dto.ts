import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AmountChangeType,
  PriceSourceType,
  StrategyInstanceStatus,
} from '../../../../../common/enums/strategy-type.enums';
import { IsNumber, IsString, Matches, Max, Min } from 'class-validator';

export class MarketMakingStrategyDto {
  @AutoMap()
  @ApiProperty({ description: 'Trading pair', example: 'BTC/USDT' })
  @Matches(/^[^/]+\/[^/]+$/)
  pair: string;

  @AutoMap()
  @ApiProperty({
    description: 'Exchange name used for execution',
    example: 'binance',
  })
  exchangeName: string;

  @AutoMap()
  @ApiPropertyOptional({
    description:
      'If provided, this exchange is used as an oracle for price data instead of `exchangeName`',
    example: 'mexc',
  })
  oracleExchangeName?: string;

  @AutoMap()
  @ApiProperty({ description: 'Bid spread as a percentage', example: 0.01 })
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'bidSpread must have at most 3 decimal places' },
  )
  @Min(0.001, { message: 'bidSpread must be at least 0.001' })
  @Max(1, { message: 'bidSpread must not exceed 100%' })
  bidSpread: number;

  @AutoMap()
  @ApiProperty({ description: 'Ask spread as a percentage', example: 0.01 })
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'askSpread must have at most 3 decimal places' },
  )
  @Min(0.001, { message: 'askSpread must be at least 0.001' })
  @Max(1, { message: 'askSpread must not exceed 100%' })
  askSpread: number;

  @AutoMap()
  @ApiProperty({ description: 'Order amount', example: 1 })
  orderAmount: number;

  @AutoMap()
  @ApiProperty({
    description: 'interval to run market-making scan',
    example: 10,
  })
  checkIntervalSeconds: number;

  @AutoMap()
  @ApiProperty({
    description: 'Number of orders you want to place on both sides',
    example: 1,
  })
  numberOfLayers: number;

  @AutoMap()
  @ApiProperty({
    description:
      'Price source type (mid_price, best_bid, best_ask, last_price)',
    example: 'mid_price',
  })
  priceSourceType: PriceSourceType;

  @AutoMap()
  @ApiProperty({
    description:
      'Amount that increases on each layer, Set to 0 for same amount',
    example: 1,
  })
  amountChangePerLayer: number;

  @AutoMap()
  @ApiProperty({
    description:
      'How the amountChangePerLayer should be interpreted (fixed, percentage)',
    example: 'percentage',
  })
  amountChangeType: AmountChangeType;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Ceiling Price, No orders above this price',
    example: '0',
  })
  ceilingPrice?: number;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Floor price, No orders below this price.',
    example: '0',
  })
  floorPrice?: number;
}

export class MarketMakingStrategyCommand {
  userId: string;
  clientId: string;
  sideA: string;
  sideB: string;
  @AutoMap()
  exchangeName: string;
  @AutoMap()
  oracleExchangeName?: string;
  @AutoMap()
  bidSpread: number;
  @AutoMap()
  askSpread: number;
  @AutoMap()
  orderAmount: number;
  @AutoMap()
  checkIntervalSeconds: number;
  @AutoMap()
  numberOfLayers: number;
  @AutoMap()
  priceSourceType: PriceSourceType;
  @AutoMap()
  amountChangePerLayer: number;
  @AutoMap()
  amountChangeType: AmountChangeType;
  @AutoMap()
  ceilingPrice?: number;
  @AutoMap()
  floorPrice?: number;
}

export class MarketMakingStrategyData {
  id: number;
  userId: string;
  clientId: string;
  sideA: string;
  sideB: string;
  exchangeName: string;
  oracleExchangeName?: string;
  bidSpread: number;
  askSpread: number;
  orderAmount: number;
  checkIntervalSeconds: number;
  numberOfLayers: number;
  priceSourceType: PriceSourceType;
  amountChangePerLayer: number;
  amountChangeType: AmountChangeType;
  ceilingPrice?: number;
  floorPrice?: number;
  status: StrategyInstanceStatus;
  lastTradingAttemptAt: Date;
}

export class MarketMakingStrategyActionDto {
  @AutoMap()
  @ApiProperty({ example: '1' })
  @IsString()
  id: string;
}

export class MarketMakingStrategyActionCommand {
  @AutoMap()
  id: number;

  userId: string;
  clientId: string;
}
