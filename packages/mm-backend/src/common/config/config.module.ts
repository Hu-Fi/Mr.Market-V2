import { Module } from '@nestjs/common';
import { TypeormConfig } from './typeorm.config';

@Module({
  providers: [TypeormConfig],
  exports: [TypeormConfig],
})
export class ConfigModule {}
