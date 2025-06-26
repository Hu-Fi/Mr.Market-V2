import { Injectable, NotFoundException } from '@nestjs/common';
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
import { JoinCampaignResultDto } from './campaign.model';
import { GetAllDefaultAccountsStrategy } from '../exchange-registry/exchange-manager/strategies/get-all-default-accounts.strategy';

@Injectable()
export class CampaignService {
  private readonly logger = new CustomLogger(CampaignService.name);

  CAMPAIGN_LAUNCHER_API_URL: string;
  RECORDING_ORACLE_API_URL: string;
  RECORDING_ORACLE_API_KEY: string;

  private readonly SUPPORTED_CHAIN_IDS: number[] = [137, 1];
  private readonly CAMPAIGN_ENDPOINT: string = '/campaign?chainId=';

  REGISTER_TO_CAMPAIGN_ENDPOINT: string = '/mr-market/campaign';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly web3IdentityService: Web3IdentityService,
    private readonly campaignRepository: CampaignRepository,
    private readonly allDefaultAccountsStrategy: GetAllDefaultAccountsStrategy,
  ) {
    this.CAMPAIGN_LAUNCHER_API_URL = this.configService.get<string>(
      'CAMPAIGN_LAUNCHER_API_URL',
      'https://hufi-campaign-launcher-server.onrender.com',
    );
    this.RECORDING_ORACLE_API_URL = this.configService.get<string>(
      'RECORDING_ORACLE_API_URL',
      'https://hufi-recording-oracle-server.onrender.com',
    );
    this.RECORDING_ORACLE_API_KEY = this.configService.get<string>(
      'RECORDING_ORACLE_API_KEY',
      'yLrq5hCRWn',
    );
  }

  async tryJoinCampaigns(): Promise<JoinCampaignResultDto> {
    const campaigns = await this.fetchRunningCampaigns();
    const results: JoinCampaignResultDto = {
      successful: [],
      alreadyRegistered: [],
      errors: [],
    };

    for (const campaign of campaigns) {
      await this.handleCampaign(campaign, results);
    }

    return results;
  }

  private async handleCampaign(
    campaign: Campaign,
    results: JoinCampaignResultDto,
  ): Promise<void> {
    const signer = this.web3IdentityService.getSigner(campaign.chainId);
    if (!signer)
      throw new NotFoundException(
        `Wallet address not found, add your wallet and rpc urls.`,
      );

    const walletAddress = await this.getWalletAddress(
      signer,
      campaign,
      results,
    );

    const exchanges = await this.getExchanges(
      campaign.exchangeName,
      campaign,
      results,
    );

    await this.registerExchanges(exchanges, campaign, walletAddress, results);
  }

  private async getWalletAddress(
    signer: any,
    campaign: Campaign,
    results: JoinCampaignResultDto,
  ): Promise<string | null> {
    try {
      return await signer.getAddress();
    } catch (err) {
      this.logError(
        results,
        campaign.address,
        `Failed to retrieve wallet address for chainId ${campaign.chainId}: ${err.message}`,
      );
      return null;
    }
  }

  private async getExchanges(
    exchangeName: string,
    campaign: Campaign,
    results: JoinCampaignResultDto,
  ): Promise<any[]> {
    const exchanges: any = await this.exchangeRegistryService.getExchangeByName(
      {
        exchangeName,
        strategy: this.allDefaultAccountsStrategy,
      },
    );
    if (!exchanges.length) {
      this.logError(
        results,
        campaign.address,
        `No exchanges found for ${exchangeName}`,
      );
    }

    return exchanges;
  }

  private async registerExchanges(
    exchanges: any[],
    campaign: Campaign,
    walletAddress: string,
    results: JoinCampaignResultDto,
  ): Promise<void> {
    for (const e of exchanges) {
      const isRegistered = await this.persistCampaign(campaign);

      if (isRegistered) {
        results.alreadyRegistered.push(campaign.address);
      } else {
        await this.registerToRecordingOracle(
          campaign,
          e.exchange,
          walletAddress,
        );
        results.successful.push(campaign.address);
      }
    }
  }

  private logError(
    results: JoinCampaignResultDto,
    campaignAddress: string,
    message: string,
  ): void {
    results.errors.push({
      campaignAddress,
      error: message,
    });
    this.logger.error(message);
  }

  private async persistCampaign(campaign: Campaign) {
    try {
      const existingCampaign = await this.campaignRepository.findOneBy({
        campaignAddress: campaign.address,
      });

      if (existingCampaign) {
        return true;
      }

      await this.campaignRepository.save({
        chainId: campaign.chainId,
        exchangeName: campaign.exchangeName,
        campaignAddress: campaign.address,
      });

      return false;
    } catch (error) {
      console.error(`Unexpected error while persisting campaign:`, error);
      throw error;
    }
  }

  private async registerToRecordingOracle(
    campaign: Campaign,
    exchange: ExchangeCredentials,
    walletAddress: string,
  ): Promise<boolean> {
    const url = `${this.RECORDING_ORACLE_API_URL}${this.REGISTER_TO_CAMPAIGN_ENDPOINT}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.RECORDING_ORACLE_API_KEY,
    };
    const payload = {
      wallet_address: walletAddress,
      chain_id: campaign.chainId,
      address: campaign.address,
      exchange_name: campaign.exchangeName,
      api_key: exchange.apiKey,
      secret: exchange.secret,
    };

    try {
      const registrationResponse = await lastValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      return registrationResponse.status === 200;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        return false;
      }
    }
  }

  async fetchRunningCampaigns() {
    try {
      const campaignPromises = this.SUPPORTED_CHAIN_IDS.map((chainId) =>
        lastValueFrom(
          this.httpService.get(
            `${this.CAMPAIGN_LAUNCHER_API_URL}${this.CAMPAIGN_ENDPOINT}${chainId}`,
          ),
        ),
      );

      const responses = await Promise.all(campaignPromises);

      const allCampaigns = responses.flatMap((response) => response.data);
      return allCampaigns.filter((campaign: Campaign) =>
        this.isRunningCampaign(campaign),
      );
    } catch (error) {
      this.logger.error('Error fetching campaigns:', error);
      throw new Error('Error fetching campaigns from campaign launcher API');
    }
  }

  private async isRunningCampaign(campaign: Campaign) {
    const endBlockDate = new Date(campaign.endBlock * 1000);
    const isNotComplete = campaign.status !== Status.COMPLETE;
    const isBeforeEndBlock = endBlockDate >= new Date();
    return isNotComplete && isBeforeEndBlock;
  }

  async getCampaignContribution() {
    return await this.campaignRepository.find();
  }
}
