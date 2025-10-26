import { Request, Response } from 'express';
import { TMDBService } from './tmdb.service';
import { logger } from '../../config/logger';
import { errorResponse, successResponse } from '../../utils/responses';

const tmdbService = new TMDBService();

export class TMDBController {
  async searchMovies(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string;
      const page = parseInt(req.query.page as string) || 1;

      if (!query) {
        errorResponse(res, 400, 'Query parameter is required');
        return;
      }

      const result = await tmdbService.searchMovies({ query, page });
      successResponse(res, 200, 'Movies found successfully', result);
    } catch (error) {
      logger.error('Error searching movies:', error);
      errorResponse(res, 500, 'Internal server error');
    }
  }

  async getMovieDetails(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (!id) {
        errorResponse(res, 400, 'Movie ID is required');
        return;
      }

      const result = await tmdbService.getMovieDetails({ id });
      successResponse(res, 200, 'Movie details retrieved successfully', result);
    } catch (error) {
      logger.error('Error getting movie details:', error);
      errorResponse(res, 500, 'Internal server error');
    }
  }

  async getPopularMovies(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;

      const result = await tmdbService.getPopularMovies({ page });
      successResponse(res, 200, 'Popular movies retrieved successfully', result);
    } catch (error) {
      logger.error('Error getting popular movies:', error);
      errorResponse(res, 500, 'Internal server error');
    }
  }
}
