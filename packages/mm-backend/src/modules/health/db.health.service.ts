import { CustomLogger } from '../logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DbHealthService {
  private readonly logger = new CustomLogger(DbHealthService.name);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkDbHealth() {
    this.logger.debug('Checking database health...');

    return {
      'last database read': await this.cacheManager.get('SELECT'),
      'last database write': await this.cacheManager.get('INSERT'),
      'last database change': await this.cacheManager.get('UPDATE'),
    };
  }
}
