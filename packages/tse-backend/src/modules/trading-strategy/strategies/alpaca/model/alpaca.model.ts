import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsEnum, IsNumber, IsString, Matches } from 'class-validator';
import {
  DerivativeType,
  StrategyInstanceStatus,
} from '../../../../../common/enums/strategy-type.enums';
import { Decimal } from 'decimal.js';
import { Transform } from 'class-transformer';

export class AlpacaStrategyDto {
  @AutoMap()
  @ApiProperty({
    example: 'mexc',
    description: 'Exchange name used for execution with Alpaca exchange',
  })
  exchangeName: string;

  @AutoMap()
  @ApiProperty({
    example: 'spot',
    enum: DerivativeType,
    description: 'Derivative type to trade (future, option, or spot)',
  })
  @IsEnum(DerivativeType)
  derivativeType: DerivativeType;

  @AutoMap()
  @ApiProperty({
    example: 'ETH/USDT',
    description: 'The trading pair to monitor for arbitrage opportunities.',
  })
  @Matches(/^[^/]+\/[^/]+$/)
  pair: string;

  @AutoMap()
  @ApiProperty({
    example: '1.0',
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
  @ApiProperty({ example: 10, description: 'Interval to run' })
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
  derivativeType: string;
  @AutoMap()
  amountToTrade: Decimal;
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
  derivativeType: string;
  amountToTrade: Decimal;
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
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  id: number;
}

export class AlpacaStrategyActionCommand {
  @AutoMap()
  id: number;

  userId: string;
  clientId: string;
}
