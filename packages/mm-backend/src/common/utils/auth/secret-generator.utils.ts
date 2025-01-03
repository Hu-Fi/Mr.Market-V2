import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SecretGeneratorUtils {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

   async getOrGenerateSecret(): Promise<string> {
     const secretKey: string = await this.cacheManager.get('JWT_SECRET');
     if (secretKey) {
       return secretKey;
     }

     const newSecret = crypto.randomBytes(64).toString('hex');
     await this.cacheManager.set('JWT_SECRET', newSecret);
     return newSecret;
   }
}