import { Request, Response } from 'express';
import prisma from '../config/database';
import axios from 'axios';
import crypto from 'crypto';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const favoriteController = {
  // Get all favorite movies for the authenticated user
  getFavorites: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const favoriteList = await prisma.favoriteList.findUnique({
        where: { userId: req.user.id },
        include: {
          movies: {
            orderBy: { addedAt: 'desc' },
            skip: skip,
            take: limitNum,
          },
        },
      });

      if (!favoriteList) {
        res.json({
          results: [],
          total_pages: 0,
          total_results: 0,
          page: pageNum,
        });
        return;
      }

      // Get total count for pagination
      const totalCount = await prisma.favoriteListMovie.count({
        where: { favoriteListId: favoriteList.id },
      });

      const totalPages = Math.ceil(totalCount / limitNum);

      const tmdbMovieIds = favoriteList.movies.map(fm => fm.tmdbMovieId);

      if (tmdbMovieIds.length === 0) {
        res.json({
          results: [],
          total_pages: totalPages,
          total_results: totalCount,
          page: pageNum,
        });
        return;
      }

      // Fetch movie details from TMDB for each tmdbMovieId
      const movieDetailsPromises = tmdbMovieIds.map(async (tmdbId) => {
        try {
          const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
            params: {
              api_key: TMDB_API_KEY,
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
          };
        } catch (tmdbError) {
          console.error(`Error fetching TMDB movie ${tmdbId}:`, tmdbError);
          return null; // Return null for movies that couldn't be fetched
        }
      });

      const movies = (await Promise.all(movieDetailsPromises)).filter(Boolean); // Filter out nulls

      res.json({
        results: movies,
        total_pages: totalPages,
        total_results: totalCount,
        page: pageNum,
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Add a movie to the authenticated user's favorite list
  addFavorite: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tmdbMovieId } = req.body;

      if (!tmdbMovieId) {
        res.status(400).json({ error: 'tmdbMovieId is required' });
        return;
      }

      let favoriteList = await prisma.favoriteList.findUnique({
        where: { userId: req.user.id },
      });

      // If user doesn't have a favorite list, create one
      if (!favoriteList) {
        favoriteList = await prisma.favoriteList.create({
          data: {
            userId: req.user.id,
            shareToken: crypto.randomBytes(8).toString('hex'),
          },
        });
      }

      // Check if movie is already in the list
      const existingFavorite = await prisma.favoriteListMovie.findUnique({
        where: {
          favoriteListId_tmdbMovieId: {
            favoriteListId: favoriteList.id,
            tmdbMovieId: tmdbMovieId,
          },
        },
      });

      if (existingFavorite) {
        res.status(409).json({ message: 'Movie already in favorites' });
        return;
      }

      await prisma.favoriteListMovie.create({
        data: {
          favoriteListId: favoriteList.id,
          tmdbMovieId: tmdbMovieId,
        },
      });

      res.status(201).json({ message: 'Movie added to favorites' });
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove a movie from the authenticated user's favorite list
  removeFavorite: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tmdbMovieId } = req.params;

      if (!tmdbMovieId) {
        res.status(400).json({ error: 'tmdbMovieId is required' });
        return;
      }

      const favoriteList = await prisma.favoriteList.findUnique({
        where: { userId: req.user.id },
      });

      if (!favoriteList) {
        res.status(404).json({ error: 'Favorite list not found' });
        return;
      }

      await prisma.favoriteListMovie.deleteMany({
        where: {
          favoriteListId: favoriteList.id,
          tmdbMovieId: parseInt(tmdbMovieId),
        },
      });

      res.json({ message: 'Movie removed from favorites' });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Check if a movie is in the authenticated user's favorite list
  checkFavorite: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ isFavorite: false }); // Not authenticated, so not a favorite
        return;
      }

      const { tmdbMovieId } = req.params;

      if (!tmdbMovieId) {
        res.status(400).json({ error: 'tmdbMovieId is required' });
        return;
      }

      const favoriteList = await prisma.favoriteList.findUnique({
        where: { userId: req.user.id },
      });

      if (!favoriteList) {
        res.json({ isFavorite: false });
        return;
      }

      const existingFavorite = await prisma.favoriteListMovie.findUnique({
        where: {
          favoriteListId_tmdbMovieId: {
            favoriteListId: favoriteList.id,
            tmdbMovieId: parseInt(tmdbMovieId),
          },
        },
      });

      res.json({ isFavorite: !!existingFavorite });
    } catch (error) {
      console.error('Error checking favorite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a shared favorite list by shareToken
  getSharedList: async (req: Request, res: Response): Promise<void> => {
    try {
      const { shareToken } = req.params;

      const favoriteList = await prisma.favoriteList.findUnique({
        where: { shareToken },
        include: {
          user: {
            select: { name: true },
          },
          movies: {
            orderBy: { addedAt: 'desc' },
          },
        },
      });

      if (!favoriteList) {
        res.status(404).json({ error: 'Shared list not found' });
        return;
      }

      const tmdbMovieIds = favoriteList.movies.map(fm => fm.tmdbMovieId);

      if (tmdbMovieIds.length === 0) {
        res.json({ owner: favoriteList.user.name, movies: [] });
        return;
      }

      // Fetch movie details from TMDB for each tmdbMovieId
      const movieDetailsPromises = tmdbMovieIds.map(async (tmdbId) => {
        try {
          const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
            params: {
              api_key: TMDB_API_KEY,
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
          };
        } catch (tmdbError) {
          console.error(`Error fetching TMDB movie ${tmdbId} for shared list:`, tmdbError);
          return null;
        }
      });

      const movies = (await Promise.all(movieDetailsPromises)).filter(Boolean);

      res.json({
        owner: favoriteList.user.name,
        movies,
      });
    } catch (error) {
      console.error('Error getting shared list:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Generate a new share token for the authenticated user's favorite list
  generateShareToken: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let favoriteList = await prisma.favoriteList.findUnique({
        where: { userId: req.user.id },
      });

      if (!favoriteList) {
        favoriteList = await prisma.favoriteList.create({
          data: {
            userId: req.user.id,
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

      res.json({ shareToken: favoriteList.shareToken });
    } catch (error) {
      console.error('Error generating share token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

