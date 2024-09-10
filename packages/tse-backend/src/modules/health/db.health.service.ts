import { InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { CustomLogger } from '../logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DbHealthService {
  private readonly logger = new CustomLogger(DbHealthService.name);
  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    private readonly dataSource: DataSource,
  ){}

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
}