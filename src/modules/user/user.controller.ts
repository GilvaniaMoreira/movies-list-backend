import { Request, Response } from 'express';
import { UserService } from './user.service';
import { logger } from '../../config/logger';
import { errorResponse, successResponse } from '../../utils/responses';

const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const result = await userService.getProfile(req.user.id);
      successResponse(res, 200, 'Profile retrieved successfully', result);
    } catch (error) {
      logger.error('Error getting user profile:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('not found') ? 404 : 500;
      errorResponse(res, statusCode, message);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const result = await userService.updateProfile(req.user.id, req.body);
      successResponse(res, 200, result.message, result);
    } catch (error) {
      logger.error('Error updating user profile:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('already in use') ? 400 : 500;
      errorResponse(res, statusCode, message);
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const result = await userService.deleteUser(req.user.id);
      successResponse(res, 200, result.message);
    } catch (error) {
      logger.error('Error deleting user:', error);
      errorResponse(res, 500, 'Internal server error');
    }
  }
}
