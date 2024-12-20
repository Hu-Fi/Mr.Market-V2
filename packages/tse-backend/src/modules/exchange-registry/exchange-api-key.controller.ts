import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ExchangeApiKeyService } from './exchange-api-key.service';
import { ExchangeApiKeyCommand, ExchangeApiKeyDto } from './model/exchange-api-key.model';


@ApiTags('exchange api key')
@UsePipes(new ValidationPipe())
@Controller('exchange-api-key')
export class ExchangeApiKeyController {
  constructor(
    private readonly service: ExchangeApiKeyService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/') async addExchangeApiKey(@Body() dto: ExchangeApiKeyDto) {
    const command = this.mapper.map(dto, ExchangeApiKeyDto, ExchangeApiKeyCommand);
    return await this.service.addExchangeApiKey(command);
  }
}