import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { logger } from '../../config/logger';
import { errorResponse, successResponse } from '../../utils/responses';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      successResponse(res, 201, result.message, result);
    } catch (error) {
      logger.error('Error registering user:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('already exists') ? 400 : 500;
      errorResponse(res, statusCode, message);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      successResponse(res, 200, result.message, result);
    } catch (error) {
      logger.error('Error logging in:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('Invalid credentials') ? 401 : 500;
      errorResponse(res, statusCode, message);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const result = await authService.getProfile(req.user.id);
      successResponse(res, 200, 'Profile retrieved successfully', result);
    } catch (error) {
      logger.error('Error getting profile:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('not found') ? 404 : 500;
      errorResponse(res, statusCode, message);
    }
  }
}
