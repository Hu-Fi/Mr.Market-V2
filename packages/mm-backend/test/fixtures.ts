import * as dotenv from 'dotenv';
dotenv.config();

// Bearers
export const USER_BEARER = process.env.E2E_USER_BEARER;
export const MM_USER_BEARER = process.env.E2E_MRMARKET_USER_BEARER;

// API Keys
export const CAMPAIGN_LAUNCHER_API_KEY = process.env.E2E_CAMPAIGN_LAUNCHER_API_KEY;
export const RECORDING_ORACLE_API_KEY = process.env.E2E_RECORDING_ORACLE_API_KEY;
export const EXCHANGE_API_KEY = process.env.E2E_EXCHANGE_API_KEY;
export const EXCHANGE_SECRET = process.env.E2E_EXCHANGE_SECRET;

// APIs
export const CAMPAIGN_LAUNCHER_API = process.env.E2E_CAMPAIGN_LAUNCHER_API;
export const RECORDING_ORACLE_API = process.env.E2E_RECORDING_ORACLE_API;

// Constants
export const CHAIN_ID = 80002;
export const EXCHANGE_NAME = 'mexc';
export const TOKEN = 'XIN/USDT';

// Addresses
export const TRUSTED_ADDRESS = process.env.E2E_TRUSTED_ADDRESS;
export const BOT_ADDRESS = process.env.E2E_BOT_ADDRESS;

// Payloads
export const campaignPayload = {
  chainId: CHAIN_ID,
  requesterAddress: TRUSTED_ADDRESS,
  exchangeName: EXCHANGE_NAME,
  token: TOKEN,
  startDate: "2024-10-15T13:35:36.226Z",
  duration: 86400,
  fundAmount: "100000000000000",
  additionalData: "",
};

export const joinCampaignPayload = (foundId: string) => ({
  chain_id: Number(CHAIN_ID),
  address: foundId,
});

export const calculateLiquidityPayload = (campaignAddress: string) => ({
  chain_id: CHAIN_ID,
  address: campaignAddress,
});

export const botJoinCampaignPayload = (testedCampaign: string) => ({
  wallet_address: BOT_ADDRESS,
  chain_id: CHAIN_ID,
  address: testedCampaign,
  exchange_name: EXCHANGE_NAME,
  api_key: EXCHANGE_API_KEY,
  secret: EXCHANGE_SECRET,
});

export const userStrategyPayload = {
  userId: '123',
  clientId: '456',
  pair: 'ETH/USDT',
  amountToTrade: 1.0,
  minProfitability: 0.01,
  exchangeAName: 'binance',
  exchangeBName: 'gate',
  checkIntervalSeconds: 10
};

export const depositPayload = {
  amount: 1000,
  assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
  chainId: '43d61dcd-e413-450d-80b8-101d5e903357',
};
