import { Injectable } from '@nestjs/common';
import { ExecutionWorkerService } from '../strategy-execution/execution-worker.service';
import { CampaignService } from '../campaign/campaign.service';

@Injectable()
export class WebSchedulerService {
  constructor(
    private readonly executionWorker: ExecutionWorkerService,
    private readonly campaignService: CampaignService,
  ) {}

  async triggerStrategyCronJob() {
    await this.executionWorker.executeStrategies();
  }

  async triggerCampaignCronJob() {
    await this.campaignService.tryJoinCampaigns();
  }
}
