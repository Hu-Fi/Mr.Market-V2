import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import { IsNumber, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Decimal } from 'decimal.js';

export class ArbitrageStrategyDto {
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
    example: 0.01,
    description:
      'Minimum profitability threshold as a decimal (e.g., 0.01 for 1%).',
  })
  minProfitability: number;

  @AutoMap()
  @ApiProperty({
    example: 'binance',
    description: 'Name of the first exchange.',
  })
  exchangeAName: string;

  @AutoMap()
  @ApiProperty({ example: 'mexc', description: 'Name of the second exchange.' })
  exchangeBName: string;

  @AutoMap()
  @ApiProperty({ example: 10, description: 'interval to run arbitrage scan' })
  checkIntervalSeconds: number;

  @AutoMap()
  @ApiProperty({ example: 1, description: 'Max number of orders' })
  maxOpenOrders?: number;
}

export class ArbitrageStrategyCommand {
  userId: string;
  clientId: string;
  sideA: string;
  sideB: string;
  @AutoMap()
  amountToTrade: Decimal;
  @AutoMap()
  minProfitability: number;
  @AutoMap()
  exchangeAName: string;
  @AutoMap()
  exchangeBName: string;
  @AutoMap()
  checkIntervalSeconds: number;
  @AutoMap()
  maxOpenOrders?: number;
}

export class ArbitrageStrategyData {
  id: number;
  userId: string;
  clientId: string;
  sideA: string;
  sideB: string;
  amountToTrade: Decimal;
  minProfitability: number;
  exchangeAName: string;
  exchangeBName: string;
  checkIntervalSeconds: number;
  maxOpenOrders?: number;
  status: StrategyInstanceStatus;
  lastTradingAttemptAt: Date;
}

export class ArbitrageStrategyActionDto {
  @AutoMap()
  @ApiProperty({ example: '1' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  id: number;
}

export class ArbitrageStrategyActionCommand {
  @AutoMap()
  id: number;

  userId: string;
  clientId: string;
}
