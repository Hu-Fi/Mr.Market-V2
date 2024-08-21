import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import {
  AmountChangeType,
  PriceSourceType,
  StrategyTypeEnums,
} from '../../../../../common/enums/strategy-type.enums';

export class MarketMakingStrategyDto {
  @AutoMap()
  @ApiProperty({ description: 'User ID', example: '123' })
  userId: string;

  @AutoMap()
  @ApiProperty({ description: 'Client ID', example: '456' })
  clientId: string;

  @AutoMap()
  @ApiProperty({ description: 'Trading pair', example: 'BTC/USDT' })
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
    description: 'Order refresh time in milliseconds',
    example: 15000,
  })
  orderRefreshTime: number;

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
  @AutoMap()
  pair: string;
  @AutoMap()
  exchangeName: string;
  @AutoMap()
  bidSpread: number;
  @AutoMap()
  askSpread: number;
  @AutoMap()
  orderAmount: number;
  @AutoMap()
  orderRefreshTime: number;
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
  strategyType: StrategyTypeEnums;
}

export class MarketMakingStrategyActionDto {
  @AutoMap()
  @ApiProperty({
    example: '123',
    description: 'User ID for whom the strategy is being paused/stopped.',
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

  strategyType: StrategyTypeEnums;
}
