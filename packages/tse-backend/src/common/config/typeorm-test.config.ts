import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Operation } from '../entities/operation.entity';

@Injectable()
export class TypeormTestConfig {
  constructor(private configService: ConfigService) {}

  getTypeOrmTestConfig(): DataSourceOptions {
    return {
      type: 'postgres',
      schema: this.configService.get<string>('TEST_DATABASE_SCHEMA', 'public'),
      host: this.configService.get<string>('TEST_DATABASE_HOST', 'localhost'),
      port: parseInt(
        this.configService.get<string>('TEST_DATABASE_PORT', '5432'),
        10,
      ),
      username: this.configService.get<string>(
        'TEST_DATABASE_USERNAME',
        'postgres',
      ),
      password: this.configService.get<string>(
        'TEST_DATABASE_PASSWORD',
        'postgres',
      ),
      database: this.configService.get<string>(
        'TEST_DATABASE_NAME',
        'mr_market_v2_test',
      ),
      entities: [Order, Operation],
      synchronize: true,
      dropSchema: true,
    };
  }
}
