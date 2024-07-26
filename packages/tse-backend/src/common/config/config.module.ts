import { Module } from '@nestjs/common';
import { TypeOrmConfigService } from './typeorm-config.service';

@Module({
  providers: [TypeOrmConfigService],
  exports: [TypeOrmConfigService],
})
export class ConfigModule {}
