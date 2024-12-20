import { Module } from '@nestjs/common';
import { ExchangeRegistryService } from './exchange-registry.service';
import { ConfigService } from '@nestjs/config';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeApiKey } from '../../common/entities/exchange-api-key.entity';
import { ExchangeApiKeyRepository } from './exchange-api-key.repository';
import { ExchangeApiKeyProfile } from './exchange-api-key.mapper';
import { ExchangeApiKeyController } from './exchange-api-key.controller';
import { ExchangeApiKeyService } from './exchange-api-key.service';

@Module({
  imports: [IntegrationsModule, TypeOrmModule.forFeature([ExchangeApiKey])],
  providers: [ExchangeRegistryService, ConfigService, ExchangeApiKeyService, ExchangeApiKeyRepository, ExchangeApiKeyProfile],
  controllers: [ExchangeApiKeyController],
  exports: [ExchangeRegistryService, ExchangeApiKeyService],
})
export class ExchangeRegistryModule {}
