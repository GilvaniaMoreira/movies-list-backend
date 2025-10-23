import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import crypto from 'crypto';

export const authController = {
  // Register a new user
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user with favorite list
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          favoriteList: { // Automatically create a favorite list
            create: {
              shareToken: crypto.randomBytes(8).toString('hex'), // Generate a unique share token
            },
          },
        },
      });

      // Generate token
      const token = generateToken({ id: user.id, email: user.email });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Login user
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate token
      const token = generateToken({ id: user.id, email: user.email });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get current user profile
  getProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

