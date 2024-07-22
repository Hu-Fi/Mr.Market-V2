import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmConfigService } from './typeorm-config.service';

ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
});

const configService = new ConfigService();
const typeOrmConfigService = new TypeOrmConfigService(configService);

export const dataSource = new DataSource(typeOrmConfigService.getTypeOrmConfig());
