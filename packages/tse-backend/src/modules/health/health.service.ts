import { Injectable } from '@nestjs/common';
import { DbHealthService } from './db.health.service';
import { ExchangesHealthService } from './exchanges.health.service';
import { StrategiesHealthService } from './strategies.health.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly dbHealthService: DbHealthService,
    private readonly exchangesHealthService: ExchangesHealthService,
    private readonly strategiesHealthService: StrategiesHealthService,
  ) {}

  async geHealthStatuses() {
    return {
      db: await this.dbHealthService.checkDbHealth(),
      exchanges: await this.exchangesHealthService.checkExchanges(),
      strategies: await this.strategiesHealthService.checkStrategies(),
    };
  }
}
