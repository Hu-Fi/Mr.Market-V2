import * as dotenv from 'dotenv';
dotenv.config();

// API Keys
export const CAMPAIGN_LAUNCHER_API_KEY =
  process.env.E2E_CAMPAIGN_LAUNCHER_API_KEY;
export const RECORDING_ORACLE_API_KEY =
  process.env.E2E_RECORDING_ORACLE_API_KEY;
export const EXCHANGE_API_KEY = process.env.E2E_EXCHANGE_API_KEY;
export const EXCHANGE_SECRET = process.env.E2E_EXCHANGE_SECRET;

// APIs
export const CAMPAIGN_LAUNCHER_API = process.env.E2E_CAMPAIGN_LAUNCHER_API;
export const RECORDING_ORACLE_API = process.env.E2E_RECORDING_ORACLE_API;
export const REPUTATION_ORACLE_API = process.env.E2E_REPUTATION_ORACLE_API;
export const TSE_APP_API = process.env.E2E_TSE_APP_API;

// Constants
export const CHAIN_ID = 80002;
export const EXCHANGE_NAME_A = 'bybit';
export const EXCHANGE_NAME_B = 'mexc';
export const TOKEN = 'HMT/USDT';
export const FOUND_AMOUNT_IN_WEI = '1000000000000';
export const FOUND_AMOUNT_IN_ETHERS = '0.000001';

// Addresses
export const TRUSTED_ADDRESS = process.env.E2E_TRUSTED_ADDRESS;
export const TRUSTED_ADDRESS_PRIVATE_KEY =
  process.env.E2E_TRUSTED_ADDRESS_PRIVATE_KEY;
export const BOT_ADDRESS = process.env.E2E_BOT_ADDRESS;

// Payloads
export const campaignPayload = {
  chainId: CHAIN_ID,
  requesterAddress: TRUSTED_ADDRESS,
  exchangeName: EXCHANGE_NAME_A,
  token: TOKEN,
  startDate: Date.now(),
  duration: 86400,
  fundAmount: FOUND_AMOUNT_IN_WEI,
  additionalData: '',
};

export const joinCampaignPayload = (address: string) => ({
  chain_id: Number(CHAIN_ID),
  address: address,
});

export const calculateLiquidityPayload = (campaignAddress: string) => ({
  chain_id: CHAIN_ID,
  address: campaignAddress,
});

export const botJoinCampaignPayload = (testedCampaign: string) => ({
  wallet_address: BOT_ADDRESS,
  chain_id: CHAIN_ID,
  address: testedCampaign,
  exchange_name: EXCHANGE_NAME_A,
  api_key: EXCHANGE_API_KEY,
  secret: EXCHANGE_SECRET,
});

export const userStrategyPayload = {
  userId: '123',
  clientId: '456',
  pair: TOKEN,
  exchangeName: EXCHANGE_NAME_B,
  bidSpread: 0.1,
  askSpread: 0.1,
  orderAmount: 1,
  checkIntervalSeconds: 10,
  numberOfLayers: 1,
  priceSourceType: 'mid_price',
  amountChangePerLayer: 1,
  amountChangeType: 'percentage',
  ceilingPrice: 0,
  floorPrice: 0,
};

export const depositPayload = {
  amount: 1000,
  assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
  chainId: '43d61dcd-e413-450d-80b8-101d5e903357',
};

export const newCampaignPayload = {
  chainId: CHAIN_ID,
  manifestUrl: null,
  manifestHash: null,
  tokenAddress: '0x792abbcC99c01dbDec49c9fa9A828a186Da45C33',
  fundAmount: FOUND_AMOUNT_IN_ETHERS,
};
