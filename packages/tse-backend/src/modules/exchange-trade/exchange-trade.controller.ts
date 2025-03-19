import {
  Body,
  Controller,
  Post, UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ExchangeTradeService } from './exchange-trade.service';
import {
  CancelOrderCommand,
  CancelOrderDto,
  MarketLimitCommand,
  MarketLimitDto,
  MarketTradeCommand,
  MarketTradeDto,
} from './model/exchange-trade.model';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('exchange trade service')
@UsePipes(new ValidationPipe())
@Controller('exchange-trade')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExchangeTradeController {
  constructor(
    private readonly tradeService: ExchangeTradeService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/market')
  @ApiOperation({ summary: 'Execute a market trade' })
  async handleMarketTrade(@Body() dto: MarketTradeDto) {
    const command = this.mapper.map(dto, MarketTradeDto, MarketTradeCommand);
    return await this.tradeService.executeMarketTrade(command);
  }

  @Post('/limit')
  @ApiOperation({ summary: 'Execute a limit trade' })
  async handleLimitTrade(@Body() dto: MarketLimitDto) {
    const command = this.mapper.map(dto, MarketLimitDto, MarketLimitCommand);
    return await this.tradeService.executeLimitTrade(command);
  }

  @Post('/cancel/:orderId/:symbol')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(@Body() dto: CancelOrderDto) {
    const command = this.mapper.map(dto, CancelOrderDto, CancelOrderCommand);
    return await this.tradeService.cancelOrder(command);
  }
}
