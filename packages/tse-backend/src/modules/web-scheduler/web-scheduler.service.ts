import { Injectable } from '@nestjs/common';
import { ExecutionWorkerService } from '../strategy-execution/execution-worker.service';

@Injectable()
export class WebSchedulerService {
  constructor(private readonly executionWorker: ExecutionWorkerService) {}

  async triggerStrategyCronJob() {
    await this.executionWorker.processData();
  }
}
