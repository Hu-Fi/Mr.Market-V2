import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './common/config/typeorm-config.service';
import { IntegrationsModule } from './integrations/integrations.module';
import { ExchangeRegistryModule } from './modules/exchangeRegistry/exchangeRegistry.module';
import { ExchangeRegistryService } from './modules/exchangeRegistry/exchangeRegistry.service';

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
        const typeOrmConfigService = new TypeOrmConfigService(configService);
        return typeOrmConfigService.getTypeOrmConfig();
      },
    }),
    IntegrationsModule,
    ExchangeRegistryModule,
  ],
  controllers: [],
  providers: [
    AppService,
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
