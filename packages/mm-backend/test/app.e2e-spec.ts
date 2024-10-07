import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EscrowClient } from '@human-protocol/sdk';
import axios from 'axios';
import { Wallet, JsonRpcProvider } from 'ethers';
import * as dotenv from 'dotenv';
import { StoredResultsUrlResponse, StoreResultsParams } from '../src/common/interfaces/escrow.interfaces';
import { CampaignCreateRequestData } from '../src/common/interfaces/campaign.interfaces';
dotenv.config();

describe('Exchange oracle (mr market) integration with Recording Oracle (e2e)', () => {
  let app: INestApplication;
  const RPC_URL = process.env.E2E_RPC_URL;
  const TRUSTED_ADDRESS_PRIVATE_KEY = process.env.E2E_TRUSTED_ADDRESS_PRIVATE_KEY;
  const CHAIN_ID = process.env.E2E_CHAIN_ID;
  const ESCROW_ADDRESS = process.env.E2E_ESCROW_ADDRESS;
  const CAMPAIGN_ADDRESS = process.env.E2E_CAMPAIGN_ADDRESS;

  const escrowDataFixture = {
    url: 'https://example.com/results.json',
    hash: 'b5dad76bf6772c0f07fd5e048f6e75a5f86ee079',
  };

  const provider = new JsonRpcProvider(RPC_URL);
  const signer = new Wallet(TRUSTED_ADDRESS_PRIVATE_KEY, provider);
  let escrowClient: EscrowClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    escrowClient = await EscrowClient.build(signer);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should store results on-chain using EscrowClient', async () => {
    const params: StoreResultsParams = {
      escrowAddress: ESCROW_ADDRESS,
      url: escrowDataFixture.url,
      hash: escrowDataFixture.hash,
    };

    expect(params.escrowAddress).toBeDefined();
    expect(params.url).toBeDefined();
    expect(params.hash).toBeDefined();

    await escrowClient.storeResults(
      params.escrowAddress,
      params.url,
      params.hash,
    );
  });

  it('should retrieve results data from escrow', async () => {
    const result: string = await escrowClient.getResultsUrl(ESCROW_ADDRESS);
    const resultsUrl: StoredResultsUrlResponse = {
      url: result
    };

    expect(resultsUrl.url).toBeDefined();
    console.log(resultsUrl.url);
  });

  it('should post campaign to recording oracle API', async () => {
    const data: CampaignCreateRequestData = {
      chainId: Number(CHAIN_ID),
      address: CAMPAIGN_ADDRESS,
    };
    const url = `${process.env.E2E_RECORDING_ORACLE_API}/campaign`;

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.E2E_RECORDING_ORACLE_API_KEY
        },
      });

      expect(response.status).toBe(201);
      console.log(response.data);
    } catch (error) {
      console.error('Error posting to recording oracle API:', error);
    }
  });
});
