import { Injectable, Logger } from '@nestjs/common';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);
  private isJobRunning: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly schedulerUtils: SchedulerUtil,
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