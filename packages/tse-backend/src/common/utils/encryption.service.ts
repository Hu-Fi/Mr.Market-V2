import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async encrypt(text: string): Promise<string> {
    const keyHex = await this.getOrGenerateKey();
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  async decrypt(encrypted: string): Promise<string> {
    const keyHex = await this.getOrGenerateKey();
    const key = Buffer.from(keyHex, 'hex');
    const [iv, encryptedText] = encrypted.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex'),
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async getOrGenerateKey(): Promise<string> {
    const cachedKey = await this.cacheManager.get<string>('ENCRYPTION_KEY');
    if (cachedKey) {
      return cachedKey;
    }
    const newKey = this.generateKey();
    await this.cacheManager.set('ENCRYPTION_KEY', newKey);
    return newKey;
  }
}
