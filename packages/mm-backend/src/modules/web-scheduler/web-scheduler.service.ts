import { Injectable } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class WebSchedulerService {
  constructor(
    private readonly transactionService: TransactionService,
  ) {}

  async triggerTransactionCronJob() {
    await this.transactionService.processData();
  }
}
