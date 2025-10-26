import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../../src/modules/user/user.service';
import prisma from '../../../src/config/prisma';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
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

      const result = await userService.getProfile(userId);

      expect(result).toEqual(mockUser);
      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw error when user not found', async () => {
      const userId = 999;

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(userService.getProfile(userId)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 1;
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const mockUpdatedUser = {
        id: userId,
        name: updateData.name,
        email: updateData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // Email não existe
      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(result).toEqual({
        message: 'Profile updated successfully',
        user: mockUpdatedUser,
      });

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { email: updateData.email },
      });
      expect(vi.mocked(prisma.user.update)).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw error when email is already in use by another user', async () => {
      const userId = 1;
      const updateData = {
        email: 'existing@example.com',
      };

      const existingUser = {
        id: 2, // Different user ID
        name: 'Existing User',
        email: updateData.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        'Email already in use'
      );

      expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
        where: { email: updateData.email },
      });
      expect(vi.mocked(prisma.user.update)).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;

      vi.mocked(prisma.user.delete).mockResolvedValue({
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userService.deleteUser(userId);

      expect(result).toEqual({
        message: 'User deleted successfully',
      });

      expect(vi.mocked(prisma.user.delete)).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});