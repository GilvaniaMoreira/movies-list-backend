import { Request, Response } from 'express';
import { FavoriteListService } from './favoriteList.service';
import { logger } from '../../config/logger';
import { errorResponse, successResponse } from '../../utils/responses';

const favoriteListService = new FavoriteListService();

export class FavoriteListController {
  async getFavorites(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await favoriteListService.getFavorites(req.user.id, pagination);
      successResponse(res, 200, 'Favorites retrieved successfully', result);
    } catch (error) {
      logger.error('Error getting favorites:', error);
      errorResponse(res, 500, 'Internal server error');
    }
  }

  async addFavorite(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const result = await favoriteListService.addFavorite(req.user.id, req.body);
      successResponse(res, 201, result.message);
    } catch (error) {
      logger.error('Error adding favorite:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('already in favorites') ? 409 : 500;
      errorResponse(res, statusCode, message);
    }
  }

  async removeFavorite(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const tmdbMovieId = parseInt(req.params.tmdbMovieId);
      if (!tmdbMovieId) {
        errorResponse(res, 400, 'tmdbMovieId is required');
        return;
      }

      const result = await favoriteListService.removeFavorite(req.user.id, { tmdbMovieId });
      successResponse(res, 200, result.message);
    } catch (error) {
      logger.error('Error removing favorite:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('not found') ? 404 : 500;
      errorResponse(res, statusCode, message);
    }
  }

  async checkFavorite(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ isFavorite: false });
        return;
      }

      const tmdbMovieId = parseInt(req.params.tmdbMovieId);
      if (!tmdbMovieId) {
        errorResponse(res, 400, 'tmdbMovieId is required');
        return;
      }

      const result = await favoriteListService.checkFavorite(req.user.id, { tmdbMovieId });
      successResponse(res, 200, 'Favorite status checked', result);
    } catch (error) {
      logger.error('Error checking favorite:', error);
      errorResponse(res, 500, 'Internal server error');
    }
  }

  async getSharedList(req: Request, res: Response): Promise<void> {
    try {
      const { shareToken } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await favoriteListService.getSharedList({ shareToken }, pagination);
      successResponse(res, 200, 'Shared list retrieved successfully', result);
    } catch (error) {
      logger.error('Error getting shared list:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('not found') ? 404 : 500;
      errorResponse(res, statusCode, message);
    }
  }

  async generateShareToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const result = await favoriteListService.generateShareToken(req.user.id);
      successResponse(res, 200, 'Share token generated successfully', result);
    } catch (error) {
      logger.error('Error generating share token:', error);
      errorResponse(res, 500, 'Internal server error');
    }
  }
}
