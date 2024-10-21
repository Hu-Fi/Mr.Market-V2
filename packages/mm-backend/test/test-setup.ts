import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Deposit } from '../src/common/entities/deposit.entity';
import { Withdraw } from '../src/common/entities/withdraw.entity';
import { Wait } from 'testcontainers';

export let app: INestApplication;
export let dataSource: DataSource;
export let postgresContainer: StartedPostgreSqlContainer;
export let redisContainer: StartedRedisContainer;

export const setupTestApp = async () => {
  postgresContainer = await new PostgreSqlContainer()
    .withName('testcontainer')
    .withDatabase('testcontainer')
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
    .start();

  redisContainer = await new RedisContainer()
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections tcp'))
    .start();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      TypeOrmModule.forRootAsync({
        useFactory: () => ({
          type: 'postgres',
          host: 'localhost',
          port: postgresContainer.getPort(),
          username: postgresContainer.getUsername(),
          password: postgresContainer.getPassword(),
          database: postgresContainer.getDatabase(),
          entities: [Deposit, Withdraw],
          synchronize: true,
        }),
      }),
      TypeOrmModule.forFeature([Deposit, Withdraw]),
      AppModule,
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  dataSource = moduleRef.get<DataSource>(DataSource);
  await app.init();
};

export const shutdownServices = async () => {
  await dataSource.destroy();
  await app.close();
  await postgresContainer.stop();
  await redisContainer.stop();
};
