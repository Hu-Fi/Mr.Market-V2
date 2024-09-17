import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  AmountChangeType,
  PriceSourceType,
  StrategyInstanceStatus,
} from '../../../../../common/enums/strategy-type.enums';
import { Matches } from 'class-validator';

export class MarketMakingStrategyDto {
  @AutoMap()
  @ApiProperty({ description: 'User ID', example: '123' })
  userId: string;

  @AutoMap()
  @ApiProperty({ description: 'Client ID', example: '456' })
  clientId: string;

  @AutoMap()
  @ApiProperty({ description: 'Trading pair', example: 'BTC/USDT' })
  @Matches(/^[^/]+\/[^/]+$/)
  pair: string;

  @AutoMap()
  @ApiProperty({ description: 'Exchange name', example: 'binance' })
  exchangeName: string;

  @AutoMap()
  @ApiProperty({ description: 'Bid spread as a percentage', example: 0.1 })
  bidSpread: number;

  @AutoMap()
  @ApiProperty({ description: 'Ask spread as a percentage', example: 0.1 })
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
  @ApiProperty({
    description: 'Ceiling Price, No orders above this price',
    example: '0',
  })
  ceilingPrice?: number;

  @AutoMap()
  @ApiProperty({
    description: 'Floor price, No orders below this price.',
    example: '0',
  })
  floorPrice?: number;
}

export class MarketMakingStrategyCommand {
  @AutoMap()
  userId: string;
  @AutoMap()
  clientId: string;
  sideA: string;
  sideB: string;
  @AutoMap()
  exchangeName: string;
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
}

export class MarketMakingStrategyActionDto {
  @AutoMap()
  @ApiProperty({
    example: '123',
    description:
      'User ID for whom the strategy is being paused/stopped/deleted.',
  })
  userId: string;
  @AutoMap()
  @ApiProperty({
    example: '456',
    description: 'Client ID associated with the user.',
  })
  clientId: string;
}

export class MarketMakingStrategyActionCommand {
  @AutoMap()
  userId: string;
  @AutoMap()
  clientId: string;
}
