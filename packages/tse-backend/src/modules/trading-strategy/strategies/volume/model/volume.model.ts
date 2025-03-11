import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsString, Matches } from 'class-validator';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';

export class VolumeStrategyDto {
  @AutoMap()
  @ApiProperty({
    example: '123',
    description: 'User ID for whom the strategy is being executed.',
  })
  userId: string;

  @AutoMap()
  @ApiProperty({
    example: '456',
    description: 'Client ID associated with the user.',
  })
  clientId: string;

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
    example: 1.0,
    description: 'The amount of the asset to trade.',
  })
  amountToTrade: number;

  @AutoMap()
  @ApiProperty({
    example: '5',
    description: 'Percentage increment for offsetting from midPrice (initial offset)'
  })
  incrementPercentage: number;

  @AutoMap()
  @ApiProperty({
    example: 10,
    description: 'Time interval (in seconds) between each trade execution'
  })
  tradeIntervalSeconds: number;

  @AutoMap()
  @ApiProperty({
    example: 1,
    description: 'Number of total trades to execute'
  })
  numTotalTrades: number;

  @ApiProperty({
    example: 1,
    description: 'Rate at which to push the price upward after each successful trade, in percent',
  })
  pricePushRate: number;
}

export class VolumeStrategyCommand {
  @AutoMap()
  userId: string;
  @AutoMap()
  clientId: string;
  @AutoMap()
  exchangeName: string;

  sideA: string;
  sideB: string;

  @AutoMap()
  amountToTrade: number;
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
  amountToTrade: number;
  incrementPercentage: number;
  tradeIntervalSeconds: number;
  numTotalTrades: number;
  pricePushRate: number;
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
}
