import { Injectable, Inject, Logger } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';
import Redlock, { Lock } from 'redlock';

@Injectable()
export class WebSchedulerService {
  private logger = new Logger(WebSchedulerService.name);

  constructor(
    private readonly transactionService: TransactionService,
    @Inject('REDLOCK') private readonly redlock: Redlock,
  ) {}

  async triggerTransactionCronJob() {
    const LOCK_KEY = 'locks:transaction-cron';
    const LOCK_TTL = 1000 * 60 * 5;

    let lock: Lock | null = null;

    try {
      lock = await this.redlock.acquire([LOCK_KEY], LOCK_TTL);
      this.logger.log('Lock acquired. Running transaction cron job.');

      await this.transactionService.processData();
    } catch (error: any) {
      if (error?.name === 'LockError') {
        this.logger.warn(
          'Another instance is already running the cron job. Skipping.',
        );
      } else {
        this.logger.error('Unexpected error during cron job execution:', error);
      }
    } finally {
      if (lock) {
        try {
          await lock.release();
          this.logger.log('Lock released.');
        } catch (releaseError) {
          this.logger.error('Failed to release lock:', releaseError);
        }
      }
    }
  }
}
