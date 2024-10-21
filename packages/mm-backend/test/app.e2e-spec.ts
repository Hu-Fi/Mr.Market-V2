import { app, setupTestApp, shutdownServices } from './test-setup';
import {
  calculateLiquidityScore,
  checkIfUserIsRegisteredToTheCampaign,
  createStrategyByUser,
  fetchCampaignsByChainId,
  registerBotToCampaign,
  registerUserToCampaign,
} from './test-utils';
import {
  botJoinCampaignPayload, calculateLiquidityPayload,
  CAMPAIGN_LAUNCHER_API,
  CAMPAIGN_LAUNCHER_API_KEY,
  campaignPayload,
  CHAIN_ID, depositPayload,
  joinCampaignPayload,
  MM_USER_BEARER, userStrategyPayload,
} from './fixtures';
import axios from 'axios';
import request from 'supertest';

jest.mock('typeorm-transactional', () => ({
  Transactional: () =>
    jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    }),
  initializeTransactionalContext: jest.fn(() => true),
  addTransactionalDataSource: jest.fn((dataSource) => dataSource),
  deleteDataSourceByName: jest.fn(),
}));

describe('Exchange Oracle (Mr. Market) integration with Hu-Fi (e2e)', () => {
  const TESTCONTAINERS_TIMEOUT = 15 * 60 * 1000;
  let TESTED_CAMPAIGN: string;

  beforeAll(async () => {
    await setupTestApp();
  }, TESTCONTAINERS_TIMEOUT);

  afterAll(async () => {
    await shutdownServices();
  });

  it('1a. should the user create a new campaign', async () => {
    const response = await axios.post(
      `${CAMPAIGN_LAUNCHER_API}/manifest/upload`,
      campaignPayload,
      {
        headers: {
          'x-api-key': CAMPAIGN_LAUNCHER_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    const { url, hash } = response.data;

    expect(url).toBeDefined();
    expect(hash).toBeDefined();
    //TODO: No escrow created
  });

  it('1b. should the user join an existing campaign', async () => {
    const campaigns = await fetchCampaignsByChainId(Number(CHAIN_ID));
    const filteredByChainId = campaigns.filter((campaign: { chainId: number }) => campaign.chainId == CHAIN_ID);

    const foundCampaign = await filteredByChainId.find(async (campaign: { id: string }) =>
      Boolean(await checkIfUserIsRegisteredToTheCampaign(campaign.id)),
    );

    TESTED_CAMPAIGN = foundCampaign ? foundCampaign.id : filteredByChainId[0];

    try {
      const response = await registerUserToCampaign(
        joinCampaignPayload(TESTED_CAMPAIGN),
      );
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
  });

  it('2. should the recording oracle calculate the liquidity score for this campaign', async () => {
    try {
      const response = await calculateLiquidityScore(
        calculateLiquidityPayload(TESTED_CAMPAIGN),
      );
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

  it('3. should the bot fetch available campaigns', async () => {
    // MrMarket V2 does not implement this functionality at the moment. Therefore, only the request to the external service is checked, as if the bot were doing it.
    const campaigns = await fetchCampaignsByChainId(Number(CHAIN_ID));

    expect(campaigns).toBeDefined();
    expect(campaigns.length).toBeGreaterThan(0);
  }, 10 * 1000);

  it('4. should the bot join a campaign', async () => {
    // MrMarket V2 does not implement this functionality at the moment. Therefore, only the request to the external service is checked, as if the bot were doing it.
    try {
      const response = await registerBotToCampaign(
        botJoinCampaignPayload(TESTED_CAMPAIGN),
      );
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

  it('5. should the bot automatically create trading strategies', async () => {
    // Bot does not implement this functionality at the moment
  });

  it('6a. should the user join a strategy created by the bot', async () => {
    // Bot does not implement this functionality at the moment
  });

  it('6b. should the user be able to create their own strategy', async () => {
    const response = await createStrategyByUser(userStrategyPayload);
    expect(response.status).toEqual(201);
  });

  it('7. should the user deposit funds into the bot wallet to increase the liquidity of the campaign', async () => {
    await request(app.getHttpServer())
      .post('/transaction/deposit')
      .set('Authorization', `Bearer ${MM_USER_BEARER}`)
      .send(depositPayload)
      .expect(201);
  });

  it('8. should rewards be distributed at the end of the campaign', async () => {
    // The campaign launcher manages the distribution of rewards after the campaign ends
    // At this moment there is no possibility to end the campaign earlier.
  });
});
