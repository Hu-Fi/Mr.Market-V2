import { Injectable } from '@nestjs/common';
import { DbHealthService } from './db.health.service';
import { ExchangesHealthService } from './exchanges.health.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly dbHealthService: DbHealthService,
    private readonly exchangesHealthService: ExchangesHealthService,
  ) {}

  async geHealthStatuses() {
    return {
      db: await this.dbHealthService.checkDbHealth(),
      exchanges: await this.exchangesHealthService.checkExchanges(),
    };
  }
}
