import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
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

@ApiTags('exchange api key')
@UsePipes(new ValidationPipe())
@Controller('exchange-api-key')
export class ExchangeApiKeyController {
  constructor(
    private readonly service: ExchangeApiKeyService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/') async addExchangeApiKey(@Body() dto: ExchangeApiKeyDto) {
    const command = this.mapper.map(
      dto,
      ExchangeApiKeyDto,
      ExchangeApiKeyCommand,
    );
    return await this.service.addExchangeApiKey(command);
  }

  @Get('/') async getExchangeApiKeys() {
    return await this.service.getAllExchangeApiKeys();
  }

  @Delete('/') async removeExchangeApiKeys(@Query('id') id: number) {
    await this.service.removeExchangeApiKey(id);
  }

  @Post('/readonly') async addExchangeApiKeyReadonly(
    @Body() dto: ExchangeApiKeyReadonlyDto,
  ) {
    const command = this.mapper.map(
      dto,
      ExchangeApiKeyReadonlyDto,
      ExchangeApiKeyReadonlyCommand,
    );
    return await this.service.addExchangeApiKeyReadonly(command);
  }
}
