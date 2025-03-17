import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SecretUtils {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async getSecret(): Promise<string> {
    return await this.cacheManager.get('JWT_SECRET');
  }
}
