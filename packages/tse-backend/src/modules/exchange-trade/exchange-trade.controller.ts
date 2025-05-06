import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
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
import { RequestWithUser } from '../../common/interfaces/http-request.interfaces';

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
  async handleMarketTrade(
    @Request() req: RequestWithUser,
    @Body() dto: MarketTradeDto,
  ) {
    const command = this.mapper.map(dto, MarketTradeDto, MarketTradeCommand);
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return await this.tradeService.executeMarketTrade(command);
  }

  @Post('/limit')
  @ApiOperation({ summary: 'Execute a limit trade' })
  async handleLimitTrade(
    @Request() req: RequestWithUser,
    @Body() dto: MarketLimitDto,
  ) {
    const command = this.mapper.map(dto, MarketLimitDto, MarketLimitCommand);
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return await this.tradeService.executeLimitTrade(command);
  }

  @Post('/cancel/:orderId/:symbol')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(
    @Request() req: RequestWithUser,
    @Body() dto: CancelOrderDto,
  ) {
    const command = this.mapper.map(dto, CancelOrderDto, CancelOrderCommand);
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return await this.tradeService.cancelOrder(command);
  }
}
