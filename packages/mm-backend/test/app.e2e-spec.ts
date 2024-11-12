import {
  depositService,
  setupTestApp,
  shutdownServices,
  signinToRecordingOracleApi,
} from './test-setup';
import {
  calculateLiquidityScore,
  checkIfUserIsRegisteredToTheCampaign,
  createCampaign,
  createStrategyByUser,
  fetchCampaignsByChainId,
  manuallyExecutePayouts,
  registerBotToCampaign,
  registerUserToCampaign,
  uploadManifest,
} from './test-utils';
import {
  botJoinCampaignPayload,
  calculateLiquidityPayload,
  campaignPayload,
  CHAIN_ID,
  depositPayload,
  joinCampaignPayload,
  newCampaignPayload,
  userStrategyPayload,
} from './fixtures';

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
  const TEST_TIMEOUT = 60 * 1000;
  let TESTED_CAMPAIGN: string = null;
  let RECORDING_ORACLE_ACCESS_TOKEN: string = null;

  beforeAll(async () => {
    await setupTestApp();
    RECORDING_ORACLE_ACCESS_TOKEN = await signinToRecordingOracleApi();
  }, TESTCONTAINERS_TIMEOUT);

  afterAll(async () => {
    await shutdownServices();
  }, TESTCONTAINERS_TIMEOUT);

  it('should depositService be defined', async () => {
    expect(depositService).toBeDefined();
  });

  it(
    '1a. should the user create a new campaign',
    async () => {
      try {
        const { url, hash } = (await uploadManifest(campaignPayload)).data;
        expect(url).toBeDefined();
        expect(hash).toBeDefined();
        newCampaignPayload.manifestUrl = url;
        newCampaignPayload.manifestHash = hash;
        TESTED_CAMPAIGN = (await createCampaign(newCampaignPayload)).data;
        expect(TESTED_CAMPAIGN).toBeDefined();
      } catch (error: any) {
        if (
          error.response &&
          error.response.status === 500 &&
          error.response.data.message.includes('insufficient')
        ) {
          expect(error.response.status).toEqual(500);
        } else {
          throw error;
        }
      }
    },
    TEST_TIMEOUT,
  );

  it(
    '1b. should the user join an existing campaign',
    async () => {
      if (!TESTED_CAMPAIGN) return true; //insufficient
      try {
        const response = await registerUserToCampaign(
          joinCampaignPayload(TESTED_CAMPAIGN),
          RECORDING_ORACLE_ACCESS_TOKEN,
        );
        expect(response.status).toEqual(201);
        const userIsRegistered = Boolean(
          await checkIfUserIsRegisteredToTheCampaign(
            TESTED_CAMPAIGN,
            RECORDING_ORACLE_ACCESS_TOKEN,
          ),
        );
        expect(userIsRegistered).toEqual(true);
      } catch (error: any) {
        if (
          error.response &&
          error.response.status === 500 &&
          error.response.data.message ===
            'User already registered for the campaign'
        ) {
          expect(error.response.status).toEqual(500);
          console.log(error.response.data.message);
        } else {
          throw error;
        }
      }
    },
    TEST_TIMEOUT,
  );

  it(
    '2. should the recording oracle calculate the liquidity score for this campaign',
    async () => {
      try {
        if (!TESTED_CAMPAIGN) return true; //insufficient

        const response = await calculateLiquidityScore(
          calculateLiquidityPayload(TESTED_CAMPAIGN),
        );
        expect(response.status).toEqual(201);
      } catch (error: any) {
        if (
          error.response &&
          error.response.status === 500 &&
          String(error.response.data.message).includes('10072')
        ) {
          //{"message": "mexc {\"code\":10072,\"msg\":\"Api key info invalid\"}"}
          expect(error.response.status).toEqual(500);
        } else {
          throw error;
        }
      }
    },
    TEST_TIMEOUT,
  );
  it(
    '3. should the bot fetch available campaigns',
    async () => {
      // MrMarket V2 does not implement this functionality at the moment. Therefore, only the request to the external service is checked, as if the bot were doing it.
      const campaigns = await fetchCampaignsByChainId(Number(CHAIN_ID));

      expect(campaigns).toBeDefined();
      expect(campaigns.length).toBeGreaterThan(0);
    },
    TEST_TIMEOUT,
  );

  it(
    '4. should the bot join a campaign',
    async () => {
      if (!TESTED_CAMPAIGN) return true; //insufficient
      // MrMarket V2 does not implement this functionality at the moment. Therefore, only the request to the external service is checked, as if the bot were doing it.
      try {
        const response = await registerBotToCampaign(
          botJoinCampaignPayload(TESTED_CAMPAIGN),
        );
        expect(response.status).toEqual(201);
        const botIsRegistered = Boolean(
          await checkIfUserIsRegisteredToTheCampaign(
            TESTED_CAMPAIGN,
            RECORDING_ORACLE_ACCESS_TOKEN,
          ),
        );
        expect(botIsRegistered).toEqual(true);
      } catch (error: any) {
        if (
          error.response &&
          error.response.status === 500 &&
          String(error.response.data.message).includes(
            'Mr.Market already registered for the campaign',
          )
        ) {
          //{"message": "mexc {\"code\":10072,\"msg\":\"Api key info invalid\"}"}
          expect(error.response.status).toEqual(500);
        } else {
          throw error;
        }
      }
    },
    TEST_TIMEOUT,
  );

  it(
    '5. should the bot automatically create trading strategies',
    async () => {
      // Bot does not implement this functionality at the moment
    },
    TEST_TIMEOUT,
  );

  it(
    '6a. should the user join a strategy created by the bot',
    async () => {
      // Bot does not implement this functionality at the moment
    },
    TEST_TIMEOUT,
  );

  it(
    '6b. should the user be able to create their own strategy',
    async () => {
      const response = await createStrategyByUser(userStrategyPayload);
      expect(response.status).toEqual(201);
    },
    TEST_TIMEOUT,
  );

  it(
    '7. should the user deposit funds into the bot wallet to increase the liquidity of the campaign',
    async () => {
      const command = {
        userId: '123',
        ...depositPayload,
      };
      const depositDetails = await depositService.deposit(command);
      expect(depositDetails).toHaveProperty('assetId');
      expect(depositDetails).toHaveProperty('amount');
      expect(depositDetails).toHaveProperty('destination');
    },
    TEST_TIMEOUT,
  );

  it(
    '8. should rewards be distributed at the end of the campaign',
    async () => {
      const response = await manuallyExecutePayouts();
      expect(response.status).toEqual(201);
    },
    TEST_TIMEOUT,
  );
});
