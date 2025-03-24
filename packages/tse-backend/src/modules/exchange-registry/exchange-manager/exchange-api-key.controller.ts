import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ExchangeApiKeyService } from './exchange-api-key.service';
import {
  ExchangeApiKeyCommand,
  ExchangeApiKeyDto,
} from './model/exchange-api-key.model';
import {
  ExchangeApiKeyReadonlyCommand,
  ExchangeApiKeyReadonlyDto,
} from './model/exchange-api-key-readonly.model';
import { ExchangeApiKeyReadonlyService } from './exchange-api-key-readonly.service';
import { JwtAuthGuard } from '../../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('exchange api key')
@UsePipes(new ValidationPipe())
@Controller('exchange-api-key')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExchangeApiKeyController {
  constructor(
    private readonly exchangeApiKeyService: ExchangeApiKeyService,
    private readonly exchangeApiKeyReadonlyService: ExchangeApiKeyReadonlyService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/') async addExchangeApiKey(
    @Request() req,
    @Body() dto: ExchangeApiKeyDto,
  ) {
    const command = this.mapper.map(
      dto,
      ExchangeApiKeyDto,
      ExchangeApiKeyCommand,
    );
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return await this.exchangeApiKeyService.addExchangeApiKey(command);
  }

  @Get('/') async getExchangeApiKeys(@Request() req) {
    return await this.exchangeApiKeyService.getAllExchangeApiKeys(
      req.user.userId,
      req.user.clientId,
    );
  }

  @Delete('/') async removeExchangeApiKeys(
    @Request() req,
    @Query('id') id: number,
  ) {
    await this.exchangeApiKeyService.removeExchangeApiKey(
      id,
      req.user.userId,
      req.user.clientId,
    );
  }

  @Post('/readonly') async addExchangeApiKeyReadonly(
    @Request() req,
    @Body() dto: ExchangeApiKeyReadonlyDto,
  ) {
    const command = this.mapper.map(
      dto,
      ExchangeApiKeyReadonlyDto,
      ExchangeApiKeyReadonlyCommand,
    );
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return await this.exchangeApiKeyReadonlyService.addExchangeApiKeyReadonly(
      command,
    );
  }
}
