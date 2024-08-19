import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { buildExchangeConfigs } from '../../common/utils/config-utils';
import { ConfigService } from '@nestjs/config';
import { CcxtGateway } from '../../integrations/ccxt.gateway';

@Injectable()
export class HealthService {
  private readonly logger = new CustomLogger(HealthService.name);

  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly ccxtGateway: CcxtGateway,
  ) {}

  async geHealthStatuses() {
    return {
      db: await this.checkDbHealth(),
      exchanges: await this.checkExchanges(),
    };
  }

  async checkDbHealth() {
    this.logger.debug('Checking database health...');

    try {
      const existingTables = await this.getExistingTables();
      const expectedTables = this.getExpectedTables();

      const { missingTables } = this.compareTables(
        existingTables,
        expectedTables,
      );

      const status = missingTables.length === 0 ? 'UP' : 'DOWN';

      const result = { status, details: {} };

      if (status === 'DOWN') {
        result.details = { missingTables };
      }

      return result;
    } catch (error) {
      this.logger.error('Error checking database health:', error);
      return { status: 'DOWN', details: { error: error.message } };
    }
  }

  private async getExistingTables(): Promise<string[]> {
    const query = `
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const tables = await this.entityManager.query(query);
    return tables.map((t) => t.table_name);
  }

  private getExpectedTables(): string[] {
    const entityNames = this.dataSource.entityMetadatas.map(
      (entity) => entity.tableName,
    );
    return [...entityNames, 'migrations'];
  }

  private compareTables(existingTables: string[], expectedTables: string[]) {
    const missingTables = expectedTables.filter(
      (table) => !existingTables.includes(table),
    );
    return { missingTables };
  }

  async checkExchanges() {
    this.logger.debug('Checking exchanges configuration health...');

    const expectedExchanges = buildExchangeConfigs(this.configService);
    const actualExchangesIterator = this.ccxtGateway.getExchangesNames();
    const actualExchanges = Array.from(actualExchangesIterator);

    const missingExchanges = Object.keys(expectedExchanges).filter(
      (exchange) => !actualExchanges.includes(exchange),
    );

    const status = missingExchanges.length === 0 ? 'UP' : 'DOWN';
    const result = { status, details: {} };

    if (status === 'DOWN') {
      result.details = { missingExchanges };
    }

    return result;
  }
}
