import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsString, Matches } from 'class-validator';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import { Decimal } from 'decimal.js';

export class VolumeStrategyDto {
  @AutoMap()
  @ApiProperty({
    example: 'binance',
    description: 'Name of the exchange.',
  })
  exchangeName: string;

  @AutoMap()
  @ApiProperty({
    example: 'ETH/USDT',
    description: 'The trading pair to monitor for arbitrage opportunities.',
  })
  @Matches(/^[^/]+\/[^/]+$/)
  pair: string;

  @AutoMap()
  @ApiProperty({
    example: '0.001',
    description: 'The amount of the asset to trade.',
  })
  @IsString()
  amountToTrade: string;

  @AutoMap()
  @ApiProperty({
    example: '5',
    description:
      'Percentage increment for offsetting from midPrice (initial offset)',
  })
  incrementPercentage: number;

  @AutoMap()
  @ApiProperty({
    example: 10,
    description: 'Time interval (in seconds) between each trade execution',
  })
  tradeIntervalSeconds: number;

  @AutoMap()
  @ApiProperty({
    example: 1,
    description: 'Number of total trades to execute',
  })
  numTotalTrades: number;

  @AutoMap()
  @ApiProperty({
    example: 1,
    description:
      'Rate at which to push the price upward after each successful trade, in percent',
  })
  pricePushRate: number;
}

export class VolumeStrategyCommand {
  userId: string;
  clientId: string;

  @AutoMap()
  exchangeName: string;

  sideA: string;
  sideB: string;

  @AutoMap()
  amountToTrade: Decimal;
  @AutoMap()
  incrementPercentage: number;
  @AutoMap()
  tradeIntervalSeconds: number;
  @AutoMap()
  numTotalTrades: number;
  @AutoMap()
  pricePushRate: number;
}

export class VolumeStrategyData {
  id: number;
  userId: string;
  clientId: string;
  exchangeName: string;
  sideA: string;
  sideB: string;
  amountToTrade: Decimal;
  incrementPercentage: number;
  tradeIntervalSeconds: number;
  numTotalTrades: number;
  pricePushRate: number;
  tradesExecuted: number;
  currentMakerPrice: number;
  status: StrategyInstanceStatus;
  lastTradingAttemptAt: Date;
}

export class VolumeStrategyActionDto {
  @AutoMap()
  @ApiProperty({ example: '1' })
  @IsString()
  id: string;
}

export class VolumeStrategyActionCommand {
  @AutoMap()
  id: number;

  userId: string;
  clientId: string;
}
