import { Injectable } from '@nestjs/common';
import { CacheStrategy } from '../strategy.interface';
import { Cache } from 'cache-manager';

@Injectable()
export class UpdateStrategy implements CacheStrategy {
  async execute(cacheManager: Cache): Promise<void> {
    await cacheManager.set('UPDATE', Date.now());
  }
}
