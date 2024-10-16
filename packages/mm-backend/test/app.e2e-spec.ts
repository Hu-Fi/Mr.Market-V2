import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

describe('Exchange oracle (mr market) integration with Hu-Fi (e2e)', () => {
  let app: INestApplication;
  const EXCHANGE_API_KEY = process.env.E2E_EXCHANGE_API_KEY;
  const CAMPAIGN_LAUNCHER_API = process.env.E2E_CAMPAIGN_LAUNCHER_API;
  const UPLOAD_MANIFEST_ENDPOINT = '/manifest/upload';
  const CAMPAIGN_LAUNCHER_API_KEY = process.env.E2E_CAMPAIGN_LAUNCHER_API_KEY;
  const TRUSTED_ADDRESS = process.env.E2E_TRUSTED_ADDRESS;
  const GET_CAMPAIGNS_BY_CHAIN_ID_ENDPOINT = '/campaign';
  const RECORDING_ORACLE_API = process.env.E2E_RECORDING_ORACLE_API;
  const REGISTER_USER_TO_CAMPAIGN = '/user/campaign';
  const REGISTER_BOT_TO_CAMPAIGN = '/mr-market/campaign';
  const USER_BEARER = process.env.E2E_USER_BEARER;
  const CHECK_IF_REGISTERED_TO_CAMPAIGN = '/user/campaign';

  const CHAIN_ID = 80002;
  const EXCHANGE_NAME = 'mexc';
  const TOKEN = 'XIN/USDT';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.skip('1a. should create a new campaign', async () => {
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

  it.only('1b. should join to existing campaign', async () => {
    const campaigns = await fetchCampaignsByChainId(Number(CHAIN_ID));
    const filteredByChainId = campaigns.filter(campaign => campaign.chainId == CHAIN_ID);

    const foundCampaign = await filteredByChainId.find(async campaign =>
      Boolean(await checkIfUserIsRegisteredToTheCampaign(campaign.id))
    );

    const foundId = foundCampaign ? foundCampaign.id : filteredByChainId[0];

    const payload = {
      'chain_id': Number(CHAIN_ID),
      'address': foundId
    };

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

  it('2. should recording oracle calculate liquidity score for this campaign', async () => {
    //TODO: the called endpoint requires x-api-key
  });

  it('3. should fetch available campaigns', async () => {
    const campaigns = await fetchCampaignsByChainId(Number(CHAIN_ID));

    expect(campaigns).toBeDefined();
    expect(campaigns.length).toBeGreaterThan(0);
  }, 10 * 1000);

  it('4. should bot join a campaign', async () => {
    const campaignAddress = '0x52692f4F348d851C2B2965311fB52f63a01F45e0';
    const payload = { 'chain_id': CHAIN_ID, 'address': campaignAddress };

    const response = await registerBotToCampaign(payload);

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('true');
  });

  it('5. should bot automatically crate trading strategies', async () => {

  });

  it('6a. should user join a strategy created by bot', async () => {

  });

  it('6b. should user can create own strategy', async () => {

  });

  it('7. should user deposit funds into the bot wallet to increase the liquidity of the campaign', async () => {

  });

  it('8. should rewards be distributed at the end of the campaign', async () => {

  })

  const fetchCampaignsByChainId = async (chainId: number): Promise<any> => {
    try {
      const response = await axios.get(`${CAMPAIGN_LAUNCHER_API}${GET_CAMPAIGNS_BY_CHAIN_ID_ENDPOINT}`, {
        params: {
          chainId: chainId,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  async function registerUserToCampaign(
    payload: any,
  ) {
    try {
      return await axios.post(
        `${RECORDING_ORACLE_API}${REGISTER_USER_TO_CAMPAIGN}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_BEARER
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async function registerBotToCampaign(
    payload: any,
  ) {
    try {
      return await axios.post(
        `${RECORDING_ORACLE_API}${REGISTER_BOT_TO_CAMPAIGN}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': EXCHANGE_API_KEY
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async function checkIfUserIsRegisteredToTheCampaign(
    address: string,
  ) {
    try {
      const response = await axios.get(
        `${RECORDING_ORACLE_API}${CHECK_IF_REGISTERED_TO_CAMPAIGN}/${address}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_BEARER
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
});
