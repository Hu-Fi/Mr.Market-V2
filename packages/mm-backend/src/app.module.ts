import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './common/config/typeorm-config.service';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuthModule } from './modules/auth/auth.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';

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
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    IntegrationsModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
