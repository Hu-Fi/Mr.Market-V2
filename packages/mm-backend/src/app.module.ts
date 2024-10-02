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
import { UserBalanceModule } from './modules/user-balance/user-balance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        ADMIN_PASSWORD: Joi.string().required(),
      }),
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
    IntegrationsModule,
    AuthModule,
    UserModule,
    HealthModule,
    UserBalanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
