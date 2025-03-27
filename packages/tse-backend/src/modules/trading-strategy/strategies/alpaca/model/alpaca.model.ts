import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsString, Matches } from 'class-validator';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';

export class AlpacaStrategyDto {
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
    example: 0.01,
    description:
      'Minimum profitability threshold as a decimal (e.g., 0.01 for 1%).',
  })
  minProfitability: number;

  @AutoMap()
  @ApiProperty({ example: 'mexc', description: 'Name of the second exchange.' })
  exchangeName: string;

  @AutoMap()
  @ApiProperty({ example: 10, description: 'interval to run arbitrage scan' })
  checkIntervalSeconds: number;

  @AutoMap()
  @ApiProperty({ example: 1, description: 'Max number of orders' })
  maxOpenOrders?: number;
}

export class AlpacaStrategyCommand {
  userId: string;
  clientId: string;
  sideA: string;
  sideB: string;
  @AutoMap()
  amountToTrade: number;
  @AutoMap()
  minProfitability: number;
  @AutoMap()
  exchangeName: string;
  @AutoMap()
  checkIntervalSeconds: number;
  @AutoMap()
  maxOpenOrders?: number;
}

export class AlpacaStrategyData {
  id: number;
  userId: string;
  clientId: string;
  sideA: string;
  sideB: string;
  amountToTrade: number;
  minProfitability: number;
  exchangeName: string;
  checkIntervalSeconds: number;
  maxOpenOrders?: number;
  status: StrategyInstanceStatus;
  lastTradingAttemptAt: Date;
}

export class AlpacaStrategyActionDto {
  @AutoMap()
  @ApiProperty({ example: '1' })
  @IsString()
  id: string;
}

export class AlpacaStrategyActionCommand {
  @AutoMap()
  id: number;

  userId: string;
  clientId: string;
}
