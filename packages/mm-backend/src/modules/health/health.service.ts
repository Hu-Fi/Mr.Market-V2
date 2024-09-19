import { Injectable } from '@nestjs/common';
import { DbHealthService } from './db.health.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly dbHealthService: DbHealthService,
  ) {}

  async geHealthStatuses() {
    return {
      db: await this.dbHealthService.checkDbHealth(),
    };
  }
}
