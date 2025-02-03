import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  Campaign,
  ExchangeCredentials,
} from '../../common/interfaces/campaign.interfaces';
import { Status } from '../../common/enums/campaign.enums';
import { CustomLogger } from '../logger/logger.service';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';
import { Web3IdentityService } from './web3-identity-manager/web3-identity.service';
import { CampaignRepository } from './campaign.repository';

@Injectable()
export class CampaignService {
  private readonly logger = new CustomLogger(CampaignService.name);

  CAMPAIGN_LAUNCHER_API_URL: string;
  RECORDING_ORACLE_API_URL: string;
  RECORDING_ORACLE_API_KEY: string;

  GET_ALL_CAMPAIGNS_ENDPOINT: string = '/campaign?chainId=-1';
  REGISTER_TO_CAMPAIGN_ENDPOINT: string = '/mr-market/campaign';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly web3IdentityService: Web3IdentityService,
    private readonly campaignRepository: CampaignRepository,
  ) {
    this.CAMPAIGN_LAUNCHER_API_URL = this.configService.get<string>(
      'CAMPAIGN_LAUNCHER_API_URL',
      'https://hufi-campaign-launcher-server-testnet.onrender.com',
    );
    this.RECORDING_ORACLE_API_URL = this.configService.get<string>(
      'RECORDING_ORACLE_API_URL',
      'https://hufi-recording-oracle-testnet.onrender.com',
    );
    this.RECORDING_ORACLE_API_KEY = this.configService.get<string>(
      'RECORDING_ORACLE_API_KEY',
      'yLrq5hCRWn',
    );
  }

  async tryJoinCampaigns() {
    const campaigns = await this.fetchRunningCampaigns();

    const results = {
      successful: [] as string[],
      alreadyRegistered: [] as string[],
      errors: [] as { campaignAddress: string; error: string }[],
    };

    for (const campaign of campaigns) {
      try {
        const walletAddress = await this.web3IdentityService
          .getSigner(campaign.chainId)
          .getAddress();
        const exchange = await this.exchangeRegistryService.getExchangeByName(
          campaign.exchangeName,
        );
        if (!exchange) {
          this.logger.debug(
            `Could not find exchange ${campaign.exchangeName} for ${campaign.chainId} in exchange registry`,
          );
          return;
        }
        await this.registerToCampaign(campaign, exchange, walletAddress);
        results.successful.push(campaign.address);
        await this.campaignRepository.save({
          chainId: campaign.chainId,
          exchangeName: campaign.exchangeName,
          campaignAddress: campaign.address,
        })
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('already registered')
        ) {
          results.alreadyRegistered.push(campaign.address);
        } else {
          results.errors.push({
            campaignAddress: campaign.address,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    this.logger.debug(
      `Campaign registration summary:\n` +
        `- Successfully registered: ${results.successful.join(', ') || 'None'}\n` +
        `- Already registered: ${results.alreadyRegistered.join(', ') || 'None'}\n` +
        `- Errors: ${
          results.errors.length > 0
            ? results.errors
                .map((e) => `${e.campaignAddress}: ${e.error}`)
                .join(', ')
            : 'None'
        }`,
    );
  }

  async fetchRunningCampaigns() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.CAMPAIGN_LAUNCHER_API_URL}${this.GET_ALL_CAMPAIGNS_ENDPOINT}`,
        ),
      );
      const campaigns: Campaign[] = response.data;
      return campaigns.filter((campaign: Campaign) =>
        this.isRunningCampaign(campaign),
      );
    } catch {
      throw new Error('Error fetching campaigns from campaign launcher API');
    }
  }

  private async isRunningCampaign(campaign: Campaign) {
    const endBlockDate = new Date(campaign.endBlock * 1000);
    const isNotComplete = campaign.status !== Status.COMPLETE;
    const isBeforeEndBlock = endBlockDate >= new Date();
    return isNotComplete && isBeforeEndBlock;
  }

  async registerToCampaign(
    campaign: Campaign,
    exchangeInstance: ExchangeCredentials,
    walletAddress: string,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.RECORDING_ORACLE_API_URL}${this.REGISTER_TO_CAMPAIGN_ENDPOINT}`,
          {
            wallet_address: walletAddress,
            chain_id: campaign.chainId,
            address: campaign.address,
            exchange_name: campaign.exchangeName,
            api_key: exchangeInstance.apiKey,
            secret: exchangeInstance.secret,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.RECORDING_ORACLE_API_KEY,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Unexpected error during campaign registration');
    }
  }

  async getCampaignContribution() {
    return await this.campaignRepository.find();
  }
}
