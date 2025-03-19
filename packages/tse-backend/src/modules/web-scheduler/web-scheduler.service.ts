import { Injectable } from '@nestjs/common';
import { ExecutionWorkerService } from '../strategy-execution/execution-worker.service';
import { CampaignService } from '../campaign/campaign.service';
import { OrderService } from '../exchange-operation/order.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebSchedulerService {
  constructor(
    private readonly executionWorker: ExecutionWorkerService,
    private readonly campaignService: CampaignService,
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
  ) {}

  async triggerStrategyCronJob() {
    await this.executionWorker.executeStrategies();
  }

  async triggerCampaignCronJob() {
    await this.campaignService.tryJoinCampaigns();
  }

  async clearOldOrdersAndOperations() {
    const days = this.configService.get('ORDER_EXPIRATION_DAYS', 7);
    return await this.orderService.deleteOlderOrders(days);
  }
}
