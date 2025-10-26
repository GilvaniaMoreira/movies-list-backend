import prisma from '../../config/prisma';
import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { 
  AddFavoriteInput, 
  PaginationInput, 
  MovieIdInput, 
  ShareTokenInput 
} from './favoriteList.schema';
import { 
  FavoriteListResponse, 
  SharedListResponse, 
  FavoriteStatusResponse, 
  ShareTokenResponse,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  TMDBMovie 
} from './favoriteList.types';

export class FavoriteListService {
  private async fetchMovieDetails(tmdbIds: number[]): Promise<TMDBMovie[]> {
    const movieDetailsPromises = tmdbIds.map(async (tmdbId) => {
      try {
        const response = await axios.get(`${env.TMDB_BASE_URL}/movie/${tmdbId}`, {
          params: {
            api_key: env.TMDB_API_KEY,
            language: 'pt-BR',
          },
        });
        return {
          id: response.data.id,
          title: response.data.title,
          overview: response.data.overview,
          poster_path: response.data.poster_path ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` : null,
          release_date: response.data.release_date,
          vote_average: response.data.vote_average || 0,
          vote_count: response.data.vote_count || 0,
          backdrop_path: response.data.backdrop_path,
          runtime: response.data.runtime,
          genres: response.data.genres,
          production_companies: response.data.production_companies,
          production_countries: response.data.production_countries,
          spoken_languages: response.data.spoken_languages,
          budget: response.data.budget,
          revenue: response.data.revenue,
        };
      } catch (tmdbError) {
        logger.error(`Error fetching TMDB movie ${tmdbId}:`, tmdbError);
        return null;
      }
    });

    return (await Promise.all(movieDetailsPromises)).filter(Boolean) as TMDBMovie[];
  }

  async getFavorites(userId: number, pagination: PaginationInput): Promise<FavoriteListResponse> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const favoriteList = await prisma.favoriteList.findUnique({
      where: { userId },
      include: {
        movies: {
          orderBy: { addedAt: 'desc' },
          skip: skip,
          take: limit,
        },
      },
    });

    if (!favoriteList) {
      return {
        results: [],
        total_pages: 0,
        total_results: 0,
        page,
      };
    }

    const totalCount = await prisma.favoriteListMovie.count({
      where: { favoriteListId: favoriteList.id },
    });

    const totalPages = Math.ceil(totalCount / limit);
    const tmdbMovieIds = favoriteList.movies.map(fm => fm.tmdbMovieId);

    if (tmdbMovieIds.length === 0) {
      return {
        results: [],
        total_pages: totalPages,
        total_results: totalCount,
        page,
      };
    }

    const movies = await this.fetchMovieDetails(tmdbMovieIds);

    return {
      results: movies,
      total_pages: totalPages,
      total_results: totalCount,
      page,
    };
  }

  async addFavorite(userId: number, data: AddFavoriteInput): Promise<AddFavoriteResponse> {
    const { tmdbMovieId } = data;

    let favoriteList = await prisma.favoriteList.findUnique({
      where: { userId },
    });

    if (!favoriteList) {
      favoriteList = await prisma.favoriteList.create({
        data: {
          userId,
          shareToken: crypto.randomBytes(8).toString('hex'),
        },
      });
    }

    const existingFavorite = await prisma.favoriteListMovie.findUnique({
      where: {
        favoriteListId_tmdbMovieId: {
          favoriteListId: favoriteList.id,
          tmdbMovieId: tmdbMovieId,
        },
      },
    });

    if (existingFavorite) {
      throw new Error('Movie already in favorites');
    }

    await prisma.favoriteListMovie.create({
      data: {
        favoriteListId: favoriteList.id,
        tmdbMovieId: tmdbMovieId,
      },
    });

    return { message: 'Movie added to favorites' };
  }

  async removeFavorite(userId: number, data: MovieIdInput): Promise<RemoveFavoriteResponse> {
    const { tmdbMovieId } = data;

    const favoriteList = await prisma.favoriteList.findUnique({
      where: { userId },
    });

    if (!favoriteList) {
      throw new Error('Favorite list not found');
    }

    await prisma.favoriteListMovie.deleteMany({
      where: {
        favoriteListId: favoriteList.id,
        tmdbMovieId: tmdbMovieId,
      },
    });

    return { message: 'Movie removed from favorites' };
  }

  async checkFavorite(userId: number, data: MovieIdInput): Promise<FavoriteStatusResponse> {
    const { tmdbMovieId } = data;

    const favoriteList = await prisma.favoriteList.findUnique({
      where: { userId },
    });

    if (!favoriteList) {
      return { isFavorite: false };
    }

    const existingFavorite = await prisma.favoriteListMovie.findUnique({
      where: {
        favoriteListId_tmdbMovieId: {
          favoriteListId: favoriteList.id,
          tmdbMovieId: tmdbMovieId,
        },
      },
    });

    return { isFavorite: !!existingFavorite };
  }

  async getSharedList(data: ShareTokenInput, pagination: PaginationInput): Promise<SharedListResponse> {
    const { shareToken } = data;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const favoriteList = await prisma.favoriteList.findUnique({
      where: { shareToken },
      include: {
        user: {
          select: { name: true },
        },
        movies: {
          orderBy: { addedAt: 'desc' },
          skip: skip,
          take: limit,
        },
      },
    });

    if (!favoriteList) {
      throw new Error('Shared list not found');
    }

    const totalCount = await prisma.favoriteListMovie.count({
      where: { favoriteListId: favoriteList.id },
    });

    const totalPages = Math.ceil(totalCount / limit);
    const tmdbMovieIds = favoriteList.movies.map(fm => fm.tmdbMovieId);

    if (tmdbMovieIds.length === 0) {
      return {
        owner: favoriteList.user.name,
        results: [],
        page,
        total_pages: totalPages,
        total_results: totalCount,
      };
    }

    const movies = await this.fetchMovieDetails(tmdbMovieIds);

    return {
      owner: favoriteList.user.name,
      results: movies,
      page,
      total_pages: totalPages,
      total_results: totalCount,
    };
  }

  async generateShareToken(userId: number): Promise<ShareTokenResponse> {
    let favoriteList = await prisma.favoriteList.findUnique({
      where: { userId },
    });

    if (!favoriteList) {
      favoriteList = await prisma.favoriteList.create({
        data: {
          userId,
          shareToken: crypto.randomBytes(8).toString('hex'),
        },
      });
    } else {
      favoriteList = await prisma.favoriteList.update({
        where: { id: favoriteList.id },
        data: {
          shareToken: crypto.randomBytes(8).toString('hex'),
        },
      });
    }

    return { shareToken: favoriteList.shareToken };
  }
}
