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
    const logging: LoggerOptions = this.configService.get<string>(
      'DATABASE_LOGGING_LEVEL',
    )
      ? (this.configService
          .get<string>('DATABASE_LOGGING_LEVEL')
          .split(',') as LoggerOptions)
      : false;

    return {
      type: 'postgres',
      schema: this.configService.get<string>('DATABASE_SCHEMA', 'public'),
      host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: parseInt(
        this.configService.get<string>('DATABASE_PORT', '5432'),
        10,
      ),
      username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
      password: this.configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      database: this.configService.get<string>(
        'POSTGRES_DATABASE',
        'mr_market_v2',
      ),
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
      logging: logging,
      synchronize:
        this.configService.get<string>('DATABASE_SYNCHRONIZE', 'true') ===
        'true',
      migrationsRun:
        this.configService.get<string>(
          'DATABASE_AUTO_RUN_MIGRATIONS',
          'true',
        ) === 'true',
      ssl: this.configService.get<string>('DATABASE_SSL', 'true') === 'true',
    };
  }
}
