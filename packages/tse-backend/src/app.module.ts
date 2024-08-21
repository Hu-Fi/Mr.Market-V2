import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './common/config/typeorm.config';
import { IntegrationsModule } from './integrations/integrations.module';
import { ExchangeRegistryModule } from './modules/exchange-registry/exchange-registry.module';
import { ExchangeRegistryService } from './modules/exchange-registry/exchange-registry.service';
import { ExchangeDataModule } from './modules/exchange-data/exchange-data.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ExchangeOperationModule } from './modules/exchange-operation/exchange-operation.module';
import { ExchangeTradeModule } from './modules/exchange-trade/exchange-trade.module';
import { TradingStrategyModule } from './modules/trading-strategy/trading-strategy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const typeOrmConfigService = new TypeormConfig(configService);
        return typeOrmConfigService.getTypeOrmConfig();
      },
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    IntegrationsModule,
    ExchangeRegistryModule,
    ExchangeDataModule,
    ExchangeOperationModule,
    ExchangeTradeModule,
    TradingStrategyModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'EXCHANGE_REGISTRY_INITIALIZATION',
      useFactory: async (service: ExchangeRegistryService) => {
        await service.initializeExchanges();
      },
      inject: [ExchangeRegistryService],
    },
  ],
})
export class AppModule {}
