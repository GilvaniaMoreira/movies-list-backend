import prisma from '../../config/prisma';
import { UpdateProfileInput } from './user.schema';
import { UserProfile, UpdateProfileResponse } from './user.types';

export class UserService {
  async getProfile(userId: number): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileInput): Promise<UpdateProfileResponse> {
    // Check if email is being updated and if it already exists
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}
