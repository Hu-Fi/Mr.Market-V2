import axios from 'axios';
import { CAMPAIGN_LAUNCHER_API, RECORDING_ORACLE_API, USER_BEARER, RECORDING_ORACLE_API_KEY } from './fixtures';
import * as dotenv from 'dotenv';
dotenv.config();

export async function fetchCampaignsByChainId(chainId: number): Promise<any> {
  const response = await axios.get(`${CAMPAIGN_LAUNCHER_API}/campaign`, {
    params: {
      chainId: chainId,
    },
  });
  return response.data;
}

export async function registerUserToCampaign(payload: any) {
  return await axios.post(
    `${RECORDING_ORACLE_API}/user/campaign`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + USER_BEARER,
      },
    }
  );
}

export async function registerBotToCampaign(payload: any) {
  return await axios.post(
    `${RECORDING_ORACLE_API}/mr-market/campaign`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': RECORDING_ORACLE_API_KEY,
      },
    }
  );
}

export async function checkIfUserIsRegisteredToTheCampaign(address: string) {
  const response = await axios.get(
    `${RECORDING_ORACLE_API}/user/campaign/${address}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + USER_BEARER,
      },
    }
  );
  return response.data;
}

export async function calculateLiquidityScore(payload: any) {
  return await axios.post(
    `${RECORDING_ORACLE_API}/liquidity-score/calculate`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': RECORDING_ORACLE_API_KEY,
      },
    }
  );
}

export async function createStrategyByUser(payload: any) {
  return await axios.post(
    `${process.env.E2E_TSE_APP_API}/arbitrage/create-arbitrage`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
