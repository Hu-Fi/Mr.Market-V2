import { Module } from '@nestjs/common';
import { TypeormConfig } from './typeorm.config';
import { CustomAdapter } from './socket-io-adapter.config';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [TypeormConfig, CustomAdapter, ConfigService],
  exports: [TypeormConfig, CustomAdapter],
})
export class ConfigModule {}
