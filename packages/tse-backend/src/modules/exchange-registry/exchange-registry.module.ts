import { Module } from '@nestjs/common';
import { ExchangeRegistryService } from './exchange-registry.service';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeApiKey } from '../../common/entities/exchange-api-key.entity';
import { ExchangeApiKeyRepository } from './exchange-manager/exchange-api-key.repository';
import { ExchangeApiKeyProfile } from './exchange-manager/exchange-api-key.mapper';
import { ExchangeApiKeyController } from './exchange-manager/exchange-api-key.controller';
import { ExchangeApiKeyService } from './exchange-manager/exchange-api-key.service';
import { EncryptionService } from '../../common/utils/encryption.service';
import { ConfigModule } from '@nestjs/config';
import { ExchangeApiKeyReadonlyRepository } from './exchange-manager/exchange-api-key-readonly.repository';
import { ExchangeApiKeyReadOnly } from '../../common/entities/exchange-api-key-read-only.entity';
import { ExchangeApiKeyReadonlyService } from './exchange-manager/exchange-api-key-readonly.service';
import { GetDefaultAccountStrategy } from './exchange-manager/strategies/get-default-account.strategy';

@Module({
  imports: [
    IntegrationsModule,
    TypeOrmModule.forFeature([ExchangeApiKey, ExchangeApiKeyReadOnly]),
    ConfigModule,
  ],
  providers: [
    ExchangeRegistryService,
    ExchangeApiKeyService,
    ExchangeApiKeyRepository,
    ExchangeApiKeyProfile,
    EncryptionService,
    ExchangeApiKeyReadonlyService,
    ExchangeApiKeyReadonlyRepository,
    GetDefaultAccountStrategy
  ],
  controllers: [ExchangeApiKeyController],
  exports: [ExchangeRegistryService, ExchangeApiKeyService, ExchangeApiKeyReadonlyService],
})
export class ExchangeRegistryModule {}
