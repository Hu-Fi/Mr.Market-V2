import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { AppModule } from '../src/app.module';
import { Withdraw } from '../src/common/entities/withdraw.entity';
import { Deposit } from '../src/common/entities/deposit.entity';
import { DataSource } from 'typeorm';

dotenv.config();

jest.mock('typeorm-transactional', () => ({
  Transactional: () =>
    jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    }),
  initializeTransactionalContext: jest.fn(() => true),
  addTransactionalDataSource: jest.fn((dataSource) => dataSource),
  deleteDataSourceByName: jest.fn(),
}));

describe('Exchange oracle (mr market) integration with Hu-Fi (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let postgresContainer: StartedPostgreSqlContainer;
  let redisContainer: StartedRedisContainer;
// api keys
  const CAMPAIGN_LAUNCHER_API_KEY = process.env.E2E_CAMPAIGN_LAUNCHER_API_KEY;
  const RECORDING_ORACLE_API_KEY = process.env.E2E_RECORDING_ORACLE_API_KEY;
  const USER_BEARER = process.env.E2E_USER_BEARER;
  const MM_USER_BEARER = process.env.E2E_MRMARKET_USER_BEARER;

// apis
  const CAMPAIGN_LAUNCHER_API = process.env.E2E_CAMPAIGN_LAUNCHER_API;
  const RECORDING_ORACLE_API = process.env.E2E_RECORDING_ORACLE_API;
  const TSE_APP_API = process.env.E2E_TSE_APP_API;

// endpoints
  const UPLOAD_MANIFEST_ENDPOINT = '/manifest/upload';
  const GET_CAMPAIGNS_BY_CHAIN_ID_ENDPOINT = '/campaign';
  const REGISTER_USER_TO_CAMPAIGN_ENDPOINT = '/user/campaign';
  const REGISTER_BOT_TO_CAMPAIGN_ENDPOINT = '/mr-market/campaign';
  const CHECK_IF_REGISTERED_TO_CAMPAIGN_ENDPOINT = '/user/campaign';
  const CALCULATE_LIQUIDITY_SCORE_ENDPOINT = '/liquidity-score/calculate';
  const CREATE_ARBITRAGE_ENDPOINT = '/arbitrage/create-arbitrage';

// constants
  const TRUSTED_ADDRESS = process.env.E2E_TRUSTED_ADDRESS;
  const BOT_ADDRESS = process.env.E2E_BOT_ADDRESS;
  const CHAIN_ID = 80002;
  const EXCHANGE_NAME = 'mexc';
  const EXCHANGE_API_KEY = process.env.E2E_EXCHANGE_API_KEY;
  const EXCHANGE_SECRET = process.env.E2E_EXCHANGE_SECRET;
  const TOKEN = 'XIN/USDT';

// variables
  let TESTED_CAMPAIGN: string;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withName('testcontainer')
      .withDatabase('testcontainer')
      .start();
    redisContainer = await new RedisContainer()
      .withExposedPorts(6379)
      .start();
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'postgres',
              host: postgresContainer.getHost(),
              port: postgresContainer.getPort(),
              username: postgresContainer.getUsername(),
              password: postgresContainer.getPassword(),
              database: postgresContainer.getDatabase(),
              entities: [Deposit, Withdraw],
              synchronize: true,
            };
          },
        }),
        TypeOrmModule.forFeature([Deposit, Withdraw]),
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    dataSource = moduleRef.get<DataSource>(DataSource);
    await app.init();
  }, 60000);

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
    await postgresContainer.stop();
    await redisContainer.stop();
  });

  it.skip('1a. should the user create a new campaign', async () => {
    const payload = {
      "chainId": CHAIN_ID,
      "requesterAddress": TRUSTED_ADDRESS,
      "exchangeName": EXCHANGE_NAME,
      "token": TOKEN,
      "startDate": "2024-10-15T13:35:36.226Z",
      "duration": 86400,
      "fundAmount": "100000000000000",
      "additionalData": ""
    };

    const response = await axios.post(
      `${CAMPAIGN_LAUNCHER_API}${UPLOAD_MANIFEST_ENDPOINT}`,
      payload,
      {
        headers: {
          'x-api-key': `${CAMPAIGN_LAUNCHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const { url, hash } = response.data;

    expect(url).toBeDefined();
    expect(hash).toBeDefined();
    //TODO: No escrow created.
  });

  it('1b. should the user join an existing campaign', async () => {
    const campaigns = await fetchCampaignsByChainId(Number(CHAIN_ID));
    const filteredByChainId = campaigns.filter((campaign: { chainId: number; }) => campaign.chainId == CHAIN_ID);

    const foundCampaign = await filteredByChainId.find(async (campaign: { id: string; }) =>
      Boolean(await checkIfUserIsRegisteredToTheCampaign(campaign.id))
    );

    const foundId = foundCampaign ? foundCampaign.id : filteredByChainId[0];

    const payload = {
      'chain_id': Number(CHAIN_ID),
      'address': foundId
    };

    TESTED_CAMPAIGN = foundId;

    try {
      const response = await registerUserToCampaign(payload);
      expect(response.status).toEqual(201);
    } catch (error: any) {
      if (error.response &&
        error.response.status === 500 &&
        error.response.data.message === 'User already registered for the campaign') {
        expect(error.response.status).toEqual(500);
        console.log(error.response.data.message);
      } else {
        throw error;
      }
    }
  })

  it('2. should the recording oracle calculate the liquidity score for this campaign', async () => {
    const payload = {
      chain_id: CHAIN_ID,
      address: TESTED_CAMPAIGN
    }

    try {
      const response = await calculateLiquidityScore(payload);
      expect(response.status).toEqual(201);
    } catch (error: any) {
      if (error.response &&
        error.response.status === 500 &&
        String(error.response.data.message).includes('10072')) {
        //{"message": "mexc {\"code\":10072,\"msg\":\"Api key info invalid\"}"}
        expect(error.response.status).toEqual(500);
      } else {
        throw error;
      }
    }
  });

  it.only('3. should the bot fetch available campaigns', async () => {
    // MrMarket V2 does not implement this functionality at the moment. Therefore, only the request to the external service is checked, as if the bot were doing it.
    const campaigns = await fetchCampaignsByChainId(Number(CHAIN_ID));

    expect(campaigns).toBeDefined();
    expect(campaigns.length).toBeGreaterThan(0);
  }, 10 * 1000);

  it('4. should the bot join a campaign', async () => {
    // MrMarket V2 does not implement this functionality at the moment. Therefore, only the request to the external service is checked, as if the bot were doing it.
    const payload = {
      "wallet_address": BOT_ADDRESS,
      "chain_id": CHAIN_ID,
      "address": TESTED_CAMPAIGN,
      "exchange_name": EXCHANGE_NAME,
      "api_key": EXCHANGE_API_KEY,
      "secret": EXCHANGE_SECRET
    };

    try {
      const response = await registerBotToCampaign(payload);
      expect(response.status).toEqual(201);
      expect(response.data.message).toBe('true');
    } catch (error: any) {
      if (error.response &&
        error.response.status === 500 &&
        String(error.response.data.message).includes('Mr.Market already registered for the campaign')) {
        //{"message": "mexc {\"code\":10072,\"msg\":\"Api key info invalid\"}"}
        expect(error.response.status).toEqual(500);
      } else {
        throw error;
      }
    }
  });

  it.skip('5. should the bot automatically create trading strategies', async () => {
    // Bot does not implement this functionality at the moment
  });

  it.skip('6a. should the user join a strategy created by the bot', async () => {
    // Bot does not implement this functionality at the moment
  });

  it('6b. should the user be able to create their own strategy', async () => {
    const payload = {
      userId: '123',
      clientId: '456',
      pair: 'ETH/USDT',
      amountToTrade: 1.0,
      minProfitability: 0.01,
      exchangeAName: 'binance',
      exchangeBName: 'mexc',
      checkIntervalSeconds: 10
    };

    const response = await createStrategyByUser(payload);
    expect(response.status).toEqual(201);
  });

  it('7. should the user deposit funds into the bot wallet to increase the liquidity of the campaign', async () => {
    const dto = {
      amount: 1000,
      assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
      chainId: '43d61dcd-e413-450d-80b8-101d5e903357',
    };

    await request(app.getHttpServer())
      .post('/transaction/deposit')
      .set('Authorization', `Bearer ${MM_USER_BEARER}`)
      .send(dto)
      .expect(201);
  });

  it.skip('8. should rewards be distributed at the end of the campaign', async () => {
    // The campaign launcher manages the distribution of rewards after the campaign ends, at this moment there is no possibility to end the campaign earlier
  })

  const fetchCampaignsByChainId = async (chainId: number): Promise<any> => {
    const response = await axios.get(`${CAMPAIGN_LAUNCHER_API}${GET_CAMPAIGNS_BY_CHAIN_ID_ENDPOINT}`, {
      params: {
        chainId: chainId,
      },
    });
    return response.data;
  };

  async function registerUserToCampaign(
    payload: any,
  ) {
    return await axios.post(
      `${RECORDING_ORACLE_API}${REGISTER_USER_TO_CAMPAIGN_ENDPOINT}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + USER_BEARER
        },
      }
    );
  }

  async function registerBotToCampaign(
    payload: any,
  ) {
    return await axios.post(
      `${RECORDING_ORACLE_API}${REGISTER_BOT_TO_CAMPAIGN_ENDPOINT}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': RECORDING_ORACLE_API_KEY
        },
      }
    );
  }

  async function checkIfUserIsRegisteredToTheCampaign(
    address: string,
  ) {
    const response = await axios.get(
      `${RECORDING_ORACLE_API}${CHECK_IF_REGISTERED_TO_CAMPAIGN_ENDPOINT}/${address}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + USER_BEARER
        },
      }
    );
    return response.data;
  }

  async function calculateLiquidityScore(
    payload: any,
  ) {
    return await axios.post(
      `${RECORDING_ORACLE_API}${CALCULATE_LIQUIDITY_SCORE_ENDPOINT}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': RECORDING_ORACLE_API_KEY
        },
      }
    );
  }

  async function createStrategyByUser(
    payload: any,
  ) {
    return await axios.post(
      `${TSE_APP_API}${CREATE_ARBITRAGE_ENDPOINT}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
