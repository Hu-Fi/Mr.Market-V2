import { CryptoUtil } from './crypto.utils';

describe('CryptoUtil', () => {
  describe('safeCompare', () => {
    it('should return true for identical strings', () => {
      const str1 = 'test123';
      const str2 = 'test123';

      expect(CryptoUtil.safeCompare(str1, str2)).toBe(true);
    });

    it('should return false for different strings', () => {
      const str1 = 'test123';
      const str2 = 'test124';

      expect(CryptoUtil.safeCompare(str1, str2)).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      const str1 = 'test123';
      const str2 = 'test123456';

      expect(CryptoUtil.safeCompare(str1, str2)).toBe(false);
    });

    it('should handle empty strings', () => {
      const str1 = '';
      const str2 = '';

      expect(CryptoUtil.safeCompare(str1, str2)).toBe(true);
    });

    it('should handle special characters', () => {
      const str1 = '!@#$%^&*()';
      const str2 = '!@#$%^&*()';

      expect(CryptoUtil.safeCompare(str1, str2)).toBe(true);
    });
  });

  describe('sha3Hash', () => {
    it('should generate consistent hash for the same input', () => {
      const input = 'test123';
      const hash1 = CryptoUtil.sha3Hash(input);
      const hash2 = CryptoUtil.sha3Hash(input);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const input1 = 'test123';
      const input2 = 'test124';

      expect(CryptoUtil.sha3Hash(input1)).not.toBe(CryptoUtil.sha3Hash(input2));
    });

    it('should generate hash of expected length (64 characters for SHA3-256)', () => {
      const input = 'test123';
      const hash = CryptoUtil.sha3Hash(input);

      expect(hash).toHaveLength(64);
    });

    it('should generate valid hexadecimal string', () => {
      const input = 'test123';
      const hash = CryptoUtil.sha3Hash(input);

      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('should handle empty string', () => {
      const input = '';
      const hash = CryptoUtil.sha3Hash(input);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('should handle special characters', () => {
      const input = '!@#$%^&*()';
      const hash = CryptoUtil.sha3Hash(input);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
  });
});
