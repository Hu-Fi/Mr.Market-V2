import { Injectable, Logger } from '@nestjs/common';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DepositService } from './deposit/deposit.service';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { Status } from '../../common/enums/transaction.enum';
import { Deposit } from '../../common/entities/deposit.entity';
import { PendingDeposit } from '../../common/interfaces/mixin.interfaces';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);
  private isJobRunning: boolean = false;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly schedulerUtils: SchedulerUtil,
    private readonly depositService: DepositService,
    private readonly mixinGateway: MixinGateway,
  ) {
  }

  onModuleInit() {
    this.schedulerUtils.addCronJob(
      TransactionService.name,
      CronExpression.EVERY_5_MINUTES,
      this.handleCron.bind(this),
      this.schedulerRegistry,
    );
  }

  private async processData() {
    this.logger.debug('Worker checking transactions in progress started');

    const pendingDeposits = await this.getPendingDeposits();
    if (!pendingDeposits) return;

    const groupedDeposits = this.groupByAssetId(pendingDeposits);
    await this.processGroupedDeposits(groupedDeposits);
  }

  private async getPendingDeposits(): Promise<Deposit[]> {
    const pendingDeposits = await this.depositService.getPendingDeposits();
    return pendingDeposits && pendingDeposits.length > 0 ? pendingDeposits : null;
  }

  private async processGroupedDeposits(groupedDeposits: Record<string, Deposit[]>) {
    await Promise.all(
      Object.entries(groupedDeposits).map(([assetId, deposits]) =>
        this.processAssetDeposits(assetId, deposits)
      )
    );
  }

  private async processAssetDeposits(assetId: string, deposits: Deposit[]) {
    const mixinPendingDeposits: PendingDeposit[] = await this.mixinGateway.getDepositsInProgress(assetId);
    if (mixinPendingDeposits?.length) {
      await this.checkAndUpdateDepositsStatus(deposits, mixinPendingDeposits);
    }
  }

  private groupByAssetId(deposits: Deposit[]) {
    const groupedDeposits = {};
    for (const deposit of deposits) {
      if (!groupedDeposits[deposit.assetId]) {
        groupedDeposits[deposit.assetId] = [];
      }
      groupedDeposits[deposit.assetId].push(deposit);
    }
    return groupedDeposits;
  }

  private async checkAndUpdateDepositsStatus(dbDeposits: Deposit[], mixinDeposits: PendingDeposit[]) {
    for (const dbDeposit of dbDeposits) {
      const isFound = mixinDeposits.some((pendingDeposit) => this.compareDeposits(pendingDeposit, dbDeposit));
      if (isFound) {
        await this.depositService.updateDepositStatus(dbDeposit.id, Status.CONFIRMED);
        this.logger.log(`Confirmed deposit for assetId: ${dbDeposit.assetId}, destination: ${dbDeposit.destination}`);
      }
    }
  }

  private compareDeposits(pendingDeposit: any, dbDeposit: any): boolean {
    const dbCreatedAt = new Date(dbDeposit.createdAt);
    const pendingCreatedAt = new Date(pendingDeposit.created_at);

    return (
      pendingDeposit.amount == dbDeposit.amount &&
      pendingCreatedAt >= dbCreatedAt &&
      pendingDeposit.confirmations >= pendingDeposit.threshold
    );
  }

  async handleCron() {
    if (this.isJobRunning) {
      this.logger.warn('Job still running, skipping');
      return;
    }
    this.isJobRunning = true;
    try {
      await this.processData();
    } catch (error) {
      this.logger.error('Error processing data', error.stack);
    } finally {
      this.isJobRunning = false;
    }
  }
}