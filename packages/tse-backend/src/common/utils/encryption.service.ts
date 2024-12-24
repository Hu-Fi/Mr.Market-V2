import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;
  private readonly key: string;

  constructor(private configService: ConfigService) {
    this.key = this.configService.get<string>(
      'ENCRYPTION_KEY', '72e5ff121f6860dbbe22c2d7ac881eaac9956e532d1ea01d1c7dda2831effd2a'
    );
  }

  encrypt(text: string): string {
    const key = Buffer.from(this.key, 'hex');
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const key = Buffer.from(this.key, 'hex');
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
}
