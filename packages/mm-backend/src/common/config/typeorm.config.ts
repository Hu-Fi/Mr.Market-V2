import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions, LoggerOptions } from 'typeorm';
import { User } from '../entities/user.entity';

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
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: parseInt(
        this.configService.get<string>('DATABASE_PORT', '5432'),
        10,
      ),
      username: this.configService.get<string>('DATABASE_USERNAME', 'postgres'),
      password: this.configService.get<string>('DATABASE_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DATABASE_NAME', 'mr_market_v2'),
      entities: [User],
      migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
      logging: logging,
      synchronize:
        this.configService.get<string>('DATABASE_SYNCHRONIZE') === 'true',
      migrationsRun:
        this.configService.get<string>('DATABASE_AUTO_RUN_MIGRATIONS') ===
        'true',
    };
  }
}
