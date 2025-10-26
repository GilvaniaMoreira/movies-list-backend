import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../../src/utils/hash';

describe('Hash Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await comparePassword(password, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await comparePassword(wrongPassword, hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });
});