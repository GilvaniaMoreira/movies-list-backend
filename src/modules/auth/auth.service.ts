import prisma from '../../config/prisma';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import crypto from 'crypto';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthResponse, ProfileResponse } from './auth.types';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const { name, email, password } = data;

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Fazer hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário com lista de favoritos
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        favoriteList: {
          create: {
            shareToken: crypto.randomBytes(8).toString('hex'),
          },
        },
      },
    });

    // Gerar token
    const token = generateToken({ id: user.id, email: user.email });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Gerar token
    const token = generateToken({ id: user.id, email: user.email });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  // Buscar perfil do usuário
  async getProfile(userId: number): Promise<ProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
