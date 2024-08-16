import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './common/config/typeorm-config.service';
import { IntegrationsModule } from './integrations/integrations.module';
import { SnapshotsModule } from './modules/mixin/snapshots/snapshots.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './modules/auth/auth.module';

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
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    IntegrationsModule,
    SnapshotsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
