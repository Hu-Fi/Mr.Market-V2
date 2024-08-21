import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { StrategyTypeEnums } from '../../../../../common/enums/strategy-type.enums';

export class ArbitrageStrategyDto {
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
    example: 'ETH/USDT',
    description: 'The trading pair to monitor for arbitrage opportunities.',
  })
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
  @ApiProperty({
    example: 'binance',
    description: 'Name of the first exchange.',
  })
  exchangeAName: string;

  @AutoMap()
  @ApiProperty({ example: 'mexc', description: 'Name of the second exchange.' })
  exchangeBName: string;
}

export class ArbitrageStrategyCommand {
  @AutoMap()
  userId: string;
  @AutoMap()
  clientId: string;
  @AutoMap()
  pair: string;
  @AutoMap()
  amountToTrade: number;
  @AutoMap()
  minProfitability: number;
  @AutoMap()
  exchangeAName: string;
  @AutoMap()
  exchangeBName: string;
}

export class ArbitrageStrategyActionDto {
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

export class ArbitrageStrategyActionCommand {
  @AutoMap()
  userId: string;
  @AutoMap()
  clientId: string;

  arbitrage: StrategyTypeEnums;
}
