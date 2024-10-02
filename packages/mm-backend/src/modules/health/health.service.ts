import { Injectable } from '@nestjs/common';
import { DbHealthService } from './db.health.service';
import { TseHealthService } from './tse.health.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly dbHealthService: DbHealthService,
    private readonly tseHealthService: TseHealthService,
  ) {}

  async geHealthStatuses() {
    return {
      db: await this.dbHealthService.checkDbHealth(),
      tse: await this.tseHealthService.checkDbHealth(),
    };
  }
}
