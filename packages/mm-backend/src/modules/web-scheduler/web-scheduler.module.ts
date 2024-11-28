import { Module } from '@nestjs/common';
import { WebSchedulerService } from './web-scheduler.service';
import { WebSchedulerController } from './web-scheduler.controller';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  providers: [WebSchedulerService],
  controllers: [WebSchedulerController]
})
export class WebSchedulerModule {}
