import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './common/config/typeorm.config';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuthModule } from './modules/auth/auth.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import Joi from 'joi';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { CacheModule } from '@nestjs/common/cache';
import { CacheFactoryConfig } from './common/config/cache-factory.config';
import { UserBalanceModule } from './modules/mixin/balance/user-balance.module';
import { TransactionModule } from './modules/mixin/transaction.module';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  deleteDataSourceByName,
} from 'typeorm-transactional';
import { ScheduleModule } from '@nestjs/schedule';
import { WebSchedulerModule } from './modules/web-scheduler/web-scheduler.module';
import { JwtModule } from '@nestjs/jwt';
import { SecretGeneratorUtils } from './common/utils/auth/secret-generator.utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        ADMIN_PASSWORD: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const typeOrmConfigService = new TypeormConfig(configService);
        return typeOrmConfigService.getTypeOrmConfig();
      },
      async dataSourceFactory(options) {
        deleteDataSourceByName('default');

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    CacheModule.registerAsync(CacheFactoryConfig),
    ScheduleModule.forRoot(),
    IntegrationsModule,
    AuthModule,
    JwtModule.registerAsync({
      global: true,
      imports: [AuthModule],
      useFactory: async (secretGeneratorUtils: SecretGeneratorUtils) => {
        const secret = await secretGeneratorUtils.getOrGenerateSecret();
        return {
          secret,
          signOptions: { expiresIn: '15m' },
        };
      },
      inject: [SecretGeneratorUtils],
    }),
    UserModule,
    HealthModule,
    UserBalanceModule,
    TransactionModule,
    WebSchedulerModule,
  ],
})
export class AppModule {}
