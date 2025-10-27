import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { hashPassword, comparePassword } from '../../../src/utils/hash';
import { generateToken } from '../../../src/utils/jwt';
import prisma from '../../../src/config/prisma';

// Mock de utils
vi.mock('../../../src/utils/hash');
vi.mock('../../../src/utils/jwt');

const mockHashPassword = vi.mocked(hashPassword);
const mockComparePassword = vi.mocked(comparePassword);
const mockGenerateToken = vi.mocked(generateToken);

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFavoriteList = {
        id: 1,
        userId: 1,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      // Mock de Prisma
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      // Mock de utils
      mockHashPassword.mockResolvedValue('hashedpassword');
      mockGenerateToken.mockReturnValue('jwt-token');

      const result = await authService.register(userData);

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockHashPassword).toHaveBeenCalledWith(userData.password);
      expect(vi.mocked(prisma.user.create)).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: 'hashedpassword',
          favoriteList: {
            create: {
              shareToken: expect.any(String),
            },
          },
        },
      });
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        message: 'User registered successfully',
        user: { id: mockUser.id, name: mockUser.name, email: mockUser.email },
        token: 'jwt-token',
      });
    });

    it('should throw error when user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const existingUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      await expect(authService.register(userData)).rejects.toThrow(
        'User with this email already exists',
      );

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(vi.mocked(prisma.user.create)).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: loginData.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('jwt-token');

      const result = await authService.login(loginData);

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(mockComparePassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        message: 'Login successful',
        user: { id: mockUser.id, name: mockUser.name, email: mockUser.email },
        token: 'jwt-token',
      });
    });

    it('should throw error when user does not exist', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(mockComparePassword).not.toHaveBeenCalled();
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it('should throw error when password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: loginData.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(mockComparePassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await authService.getProfile(userId);

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw error when user not found', async () => {
      const userId = 999;

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.getProfile(userId)).rejects.toThrow('User not found');

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });
    });
  });
});