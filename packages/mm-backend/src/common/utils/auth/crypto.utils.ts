import { createHash } from 'crypto';
import * as crypto from 'crypto';

export class CryptoUtil {
  /**
   * Securely compares two strings using a timing-safe comparison
   * @param a - First string to compare
   * @param b - Second string to compare
   * @returns boolean indicating whether the strings are equal
   */
  static safeCompare(a: string, b: string): boolean {
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');

    try {
      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch (e) {
      console.error(`Error comparing strings: ${e.message}`);
      return false;
    }
  }

  /**
   * Creates a SHA3-256 hash of the input string
   * @param input - String to hash
   * @returns Hexadecimal string of the hash
   */
  static sha3Hash(input: string): string {
    return createHash('sha3-256').update(input).digest('hex');
  }
}
