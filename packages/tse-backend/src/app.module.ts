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
import { HealthModule } from './modules/health/health.module';
import { CacheFactoryConfig } from './common/config/cache-factory.config';
import { CacheModule } from '@nestjs/common/cache';
import { TradingStrategyModule } from './modules/trading-strategy/trading-strategy.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StrategyExecutionModule } from './modules/strategy-execution/strategy-execution.module';
import { TradingHistoryModule } from './modules/trading-history/trading-history.module';
import { ExchangeDepositModule } from './modules/exchange-deposit/exchange-deposit.module';
import { ExchangeWithdrawalModule } from './modules/exchange-withdrawal/exchange-withdrawal.module';

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
    CacheModule.registerAsync(CacheFactoryConfig),
    ScheduleModule.forRoot(),
    IntegrationsModule,
    ExchangeRegistryModule,
    ExchangeDataModule,
    ExchangeOperationModule,
    ExchangeTradeModule,
    HealthModule,
    TradingStrategyModule,
    StrategyExecutionModule,
    TradingHistoryModule,
    ExchangeDepositModule,
    ExchangeWithdrawalModule,
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
