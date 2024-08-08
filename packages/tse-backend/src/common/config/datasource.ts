import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeormConfig } from './typeorm.config';

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
});

const configService = new ConfigService();
const typeOrmConfigService = new TypeormConfig(configService);

export const dataSource = new DataSource(
  typeOrmConfigService.getTypeOrmConfig(),
);
