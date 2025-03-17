import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './common/config/typeorm.config';
import { IntegrationsModule } from './integrations/integrations.module';
import { ExchangeRegistryModule } from './modules/exchange-registry/exchange-registry.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ExchangeOperationModule } from './modules/exchange-operation/exchange-operation.module';
import { ExchangeTradeModule } from './modules/exchange-trade/exchange-trade.module';
import { HealthModule } from './modules/health/health.module';
import { CacheFactoryConfig } from './common/config/cache-factory.config';
import { CacheModule } from '@nestjs/common/cache';
import { TradingStrategyModule } from './modules/trading-strategy/trading-strategy.module';
import { StrategyExecutionModule } from './modules/strategy-execution/strategy-execution.module';
import { TradingHistoryModule } from './modules/trading-history/trading-history.module';
import { ExchangeDepositModule } from './modules/exchange-deposit/exchange-deposit.module';
import { ExchangeWithdrawalModule } from './modules/exchange-withdrawal/exchange-withdrawal.module';
import { WebSchedulerModule } from './modules/web-scheduler/web-scheduler.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { SecretUtils } from './common/utils/auth/secret-fetcher.utils';
import { JwtStrategy } from './common/utils/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

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
    PassportModule,
    IntegrationsModule,
    ExchangeRegistryModule,
    ExchangeOperationModule,
    ExchangeTradeModule,
    HealthModule,
    TradingStrategyModule,
    StrategyExecutionModule,
    TradingHistoryModule,
    ExchangeDepositModule,
    ExchangeWithdrawalModule,
    WebSchedulerModule,
    CampaignModule,
  ],
  providers: [
    SecretUtils,
    {
      provide: JwtStrategy,
      useFactory: async (util: SecretUtils) => {
        const secret = await util.getSecret();
        return new JwtStrategy(secret);
      },
      inject: [SecretUtils],
    },
  ],
  exports: [SecretUtils],
})
export class AppModule {}
