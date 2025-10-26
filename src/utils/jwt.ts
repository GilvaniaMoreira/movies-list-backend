import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (payload: { id: number; email: string }): string => {
  const expiresIn = env.JWT_EXPIRES_IN;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): { id: number; email: string } => {
  return jwt.verify(token, env.JWT_SECRET) as { id: number; email: string };
};
