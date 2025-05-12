import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3IdentityKey } from '../../common/entities/web3-identity-key.entity';
import { Web3IdentityRpc } from '../../common/entities/web3-identity-rpc.entity';
import { Web3IdentityRepository } from './web3-identity-manager/web3-identity.repository';
import { Web3IdentityProfile } from './web3-identity-manager/web3-identity.mapper';
import { Web3IdentityService } from './web3-identity-manager/web3-identity.service';
import { Web3IdentityController } from './web3-identity-manager/web3-identity.controller';
import { CampaignContribution } from '../../common/entities/campaign-contribution.entity';
import { CampaignController } from './campaign.controller';
import { CampaignRepository } from './campaign.repository';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    IntegrationsModule,
    ExchangeRegistryModule,
    TypeOrmModule.forFeature([
      Web3IdentityKey,
      Web3IdentityRpc,
      CampaignContribution,
    ]),
  ],
  providers: [
    CampaignService,
    Web3IdentityRepository,
    Web3IdentityProfile,
    Web3IdentityService,
    CampaignRepository,
  ],
  controllers: [Web3IdentityController, CampaignController],
  exports: [CampaignService],
})
export class CampaignModule {}
