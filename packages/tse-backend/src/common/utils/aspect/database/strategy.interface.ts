import { Cache } from 'cache-manager';

export interface CacheStrategy {
  execute(cacheManager: Cache): Promise<void>;
}
