import axios from 'axios';
import {
  CAMPAIGN_LAUNCHER_API,
  RECORDING_ORACLE_API,
  RECORDING_ORACLE_API_KEY,
  TRUSTED_ADDRESS_PRIVATE_KEY,
  TRUSTED_ADDRESS,
  TSE_APP_API,
  REPUTATION_ORACLE_API,
  CAMPAIGN_LAUNCHER_API_KEY,
} from './fixtures';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();

export async function fetchCampaignsByChainId(chainId: number): Promise<any> {
  const response = await axios.get(`${CAMPAIGN_LAUNCHER_API}/campaign`, {
    params: {
      chainId: chainId,
    },
  });
  return response.data;
}

export async function registerUserToCampaign(
  payload: any,
  bearerToken: string,
) {
  return await axios.post(`${RECORDING_ORACLE_API}/user/campaign`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + bearerToken,
    },
  });
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
    },
  );
}

export async function checkIfUserIsRegisteredToTheCampaign(
  address: string,
  bearerToken: string,
) {
  const response = await axios.get(
    `${RECORDING_ORACLE_API}/user/campaign/${address}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + bearerToken,
      },
    },
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
    },
  );
}

export async function createStrategyByUser(payload: any) {
  return await axios.post(
    `${TSE_APP_API}/trading-strategy/create-arbitrage`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function handleUserAuthentication() {
  const prepareSignaturePayload = { address: TRUSTED_ADDRESS, type: 'SIGNIN' };
  const response = await axios.post(
    `${RECORDING_ORACLE_API}/auth/prepare-signature`,
    prepareSignaturePayload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const message = JSON.stringify(response.data);
  const wallet = new ethers.Wallet(TRUSTED_ADDRESS_PRIVATE_KEY);
  const signature = await wallet.signMessage(message);
  const signinPayload = { address: TRUSTED_ADDRESS, signature: signature };
  return await axios.post(
    `${RECORDING_ORACLE_API}/auth/web3/signin`,
    signinPayload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function manuallyExecutePayouts() {
  return await axios.post(`${REPUTATION_ORACLE_API}/payout/manual-payout`);
}

export async function uploadManifest(payload: any) {
  return await axios.post(`${CAMPAIGN_LAUNCHER_API}/manifest/upload`, payload, {
    headers: {
      'x-api-key': CAMPAIGN_LAUNCHER_API_KEY,
      'Content-Type': 'application/json',
    },
  });
}

export async function createCampaign(payload: any) {
  return await axios.post(`${CAMPAIGN_LAUNCHER_API}/campaign`, payload, {
    headers: {
      'x-api-key': CAMPAIGN_LAUNCHER_API_KEY,
      'Content-Type': 'application/json',
    },
  });
}
