import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../../../src/utils/jwt';

describe('JWT Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { id: 1, email: 'test1@example.com' };
      const payload2 = { id: 2, email: 'test2@example.com' };
      
      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return the payload', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      
      const decoded = verifyToken(token);
      
      expect(decoded).toMatchObject(payload);
      expect(decoded).toHaveProperty('id', 1);
      expect(decoded).toHaveProperty('email', 'test@example.com');
    });

    it('should throw an error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow();
    });
  });
});