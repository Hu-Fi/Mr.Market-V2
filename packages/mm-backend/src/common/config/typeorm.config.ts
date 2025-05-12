import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions, LoggerOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { MixinDeposit } from '../entities/mixin-deposit.entity';
import { MixinWithdrawal } from '../entities/mixin-withdrawal.entity';
import { MixinAuthSession } from '../entities/mixin-auth-session.entity';

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
      entities: [User, MixinDeposit, MixinWithdrawal, MixinAuthSession],
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
