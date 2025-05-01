import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions, LoggerOptions } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Operation } from '../entities/operation.entity';
import { Arbitrage } from '../entities/arbitrage.entity';
import { MarketMaking } from '../entities/market-making.entity';
import { ExchangeApiKey } from '../entities/exchange-api-key.entity';
import { Web3IdentityKey } from '../entities/web3-identity-key.entity';
import { Web3IdentityRpc } from '../entities/web3-identity-rpc.entity';
import { Contribution } from '../entities/contribution.entity';
import { ExchangeApiKeyReadOnly } from '../entities/exchange-api-key-read-only.entity';
import { Volume } from '../entities/volume.entity';

@Injectable()
export class TypeormConfig {
  constructor(private configService: ConfigService) {}

  getTypeOrmConfig(): DataSourceOptions {
    return {
      type: 'postgres',
      schema: 'public',
      host: this.configService.get<string>('POSTGRES_HOST'),
      port: parseInt(this.configService.get('DATABASE_PORT', '5432')),
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DATABASE'),
      entities: [
        Order,
        Operation,
        Arbitrage,
        MarketMaking,
        ExchangeApiKey,
        Web3IdentityKey,
        Web3IdentityRpc,
        Contribution,
        ExchangeApiKeyReadOnly,
        Volume,
      ],
      migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
      logging: this.configService
        .get<string>('DATABASE_LOGGING_LEVEL', 'query,error,migration')
        .split(',') as LoggerOptions,
      synchronize:
        this.configService
          .get('DATABASE_SYNCHRONIZE', 'false')
          ?.toLowerCase() === 'true',
      migrationsRun:
        this.configService
          .get('DATABASE_AUTO_RUN_MIGRATIONS', 'true')
          ?.toLowerCase() === 'true',
      ssl:
        this.configService.get('DATABASE_SSL', 'true')?.toLowerCase() ===
        'true',
    };
  }
}
