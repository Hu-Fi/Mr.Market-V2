import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Deposit } from '../src/common/entities/deposit.entity';
import { Withdraw } from '../src/common/entities/withdraw.entity';
import { Wait } from 'testcontainers';
import { DepositService } from '../src/modules/transaction/deposit/deposit.service';
import { MixinGateway } from '../src/integrations/mixin.gateway';
import { DepositRepository } from '../src/modules/transaction/deposit/deposit.repository';
import { handleUserAuthentication } from './test-utils';

export let app: INestApplication;
export let dataSource: DataSource;
export let postgresContainer: StartedPostgreSqlContainer;
export let redisContainer: StartedRedisContainer;
export let depositService: DepositService;

export const setupTestApp = async () => {
  postgresContainer = await new PostgreSqlContainer()
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections'),
    )
    .start();

  redisContainer = await new RedisContainer()
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections tcp'))
    .start();

  const mockMixinGateway = {
    createDepositAddress: jest.fn().mockResolvedValue('mockedDepositAddress'),
  };

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      TypeOrmModule.forRootAsync({
        useFactory: () => ({
          type: 'postgres',
          host: postgresContainer.getHost(),
          port: postgresContainer.getPort(),
          username: postgresContainer.getUsername(),
          password: postgresContainer.getPassword(),
          database: postgresContainer.getDatabase(),
          entities: [Deposit, Withdraw],
          synchronize: true,
        }),
      }),
      TypeOrmModule.forFeature([Deposit, Withdraw]),
    ],
    providers: [
      DepositService,
      { provide: MixinGateway, useValue: mockMixinGateway },
      DepositRepository,
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  depositService = moduleRef.get<DepositService>(DepositService);
  dataSource = moduleRef.get<DataSource>(DataSource);
  await app.init();
};

export const shutdownServices = async () => {
  await dataSource.destroy();
  await app.close();
  await postgresContainer.stop();
  await redisContainer.stop();
};

export const signinToRecordingOracleApi = async () => {
  return (await handleUserAuthentication()).data?.access_token;
};
