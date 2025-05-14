import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions, LoggerOptions } from 'typeorm';
import { TradeOrder } from '../entities/trade-order.entity';
import { TradeOperation } from '../entities/trade-operation.entity';
import { StrategyArbitrage } from '../entities/startegy-arbitrage.entity';
import { StrategyMarketMaking } from '../entities/strategy-market-making.entity';
import { ExchangeApiKey } from '../entities/exchange-api-key.entity';
import { Web3IdentityKey } from '../entities/web3-identity-key.entity';
import { Web3IdentityRpc } from '../entities/web3-identity-rpc.entity';
import { CampaignContribution } from '../entities/campaign-contribution.entity';
import { ExchangeApiKeyReadOnly } from '../entities/exchange-api-key-read-only.entity';
import { StrategyVolume } from '../entities/strategy-volume.entity';
import { ExchangeDeposit } from '../entities/exchange-deposit.entity';
import { ExchangeWithdrawal } from '../entities/exchange-withdrawal.entity';

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
        ExchangeDeposit,
        ExchangeWithdrawal,
        TradeOrder,
        TradeOperation,
        StrategyArbitrage,
        StrategyMarketMaking,
        StrategyVolume,
        ExchangeApiKey,
        Web3IdentityKey,
        Web3IdentityRpc,
        ExchangeApiKeyReadOnly,
        CampaignContribution,
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
