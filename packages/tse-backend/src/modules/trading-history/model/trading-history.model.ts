import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../../common/enums/exchange-operation.enums';
import { AutoMap } from '@automapper/classes';

export class GetUserTradingHistoryParamsDto {
  @AutoMap()
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 1,
  })
  @IsString()
  userId: number;
}

export class GetUserTradingHistoryParamsCommand {
  @AutoMap()
  userId: number;
}

export class GetUserTradingHistoryQueryDto {
  @AutoMap()
  @ApiPropertyOptional({
    description: 'Start date to filter orders',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'End date to filter orders',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Name of the exchange',
    example: 'binance',
  })
  @IsOptional()
  @IsString()
  exchangeName?: string;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Trading pair (symbol)',
    example: 'BTC/USD',
  })
  @IsOptional()
  @IsString()
  symbol?: string;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Order type (limit, market)',
    enum: MarketOrderType,
    example: 'limit',
  })
  @IsOptional()
  @IsEnum(MarketOrderType)
  type?: MarketOrderType;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Order status (pending, executed, cancelled, failed)',
    enum: OrderStatus,
    example: 'executed',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Trade side (buy, sell)',
    enum: TradeSideType,
    example: 'buy',
  })
  @IsOptional()
  @IsEnum(TradeSideType)
  side?: TradeSideType;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @IsString()
  page?: number;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 10,
  })
  @IsOptional()
  @IsString()
  limit?: number;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Field to sort by (createdAt, price)',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @AutoMap()
  @ApiPropertyOptional({
    description: 'Sort order (ASC or DESC)',
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export class GetUserTradingHistoryQueryCommand {
  @AutoMap()
  startDate?: string;

  @AutoMap()
  endDate?: string;

  @AutoMap()
  exchangeName?: string;

  @AutoMap()
  symbol?: string;

  @AutoMap()
  type?: MarketOrderType;

  @AutoMap()
  status?: OrderStatus;

  @AutoMap()
  side?: TradeSideType;

  @AutoMap()
  page?: number;

  @AutoMap()
  limit?: number;

  @AutoMap()
  sortBy?: string;

  @AutoMap()
  sortOrder?: string;
}
