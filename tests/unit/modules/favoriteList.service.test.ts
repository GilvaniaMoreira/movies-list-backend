import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FavoriteListService } from '../../../src/modules/favoriteList/favoriteList.service';
import prisma from '../../../src/config/prisma';
import nock from 'nock';

describe('FavoriteListService', () => {
  let favoriteListService: FavoriteListService;

  beforeEach(() => {
    favoriteListService = new FavoriteListService();
    vi.clearAllMocks();
    nock.cleanAll();
  });

  describe('getFavorites', () => {
    it('should return empty list when user has no favorite list', async () => {
      const userId = 1;
      const pagination = { page: 1, limit: 20 };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(null);

      const result = await favoriteListService.getFavorites(userId, pagination);

      expect(result).toEqual({
        results: [],
        total_pages: 0,
        total_results: 0,
        page: 1,
      });
    });

    it('should return empty list when favorite list has no movies', async () => {
      const userId = 1;
      const pagination = { page: 1, limit: 20 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
        movies: [],
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.count).mockResolvedValue(0);

      const result = await favoriteListService.getFavorites(userId, pagination);

      expect(result).toEqual({
        results: [],
        total_pages: 0,
        total_results: 0,
        page: 1,
      });
    });

    it('should return favorites with TMDB data', async () => {
      const userId = 1;
      const pagination = { page: 1, limit: 20 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
        movies: [
          {
            id: 1,
            favoriteListId: 1,
            tmdbMovieId: 550,
            addedAt: new Date(),
          },
        ],
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.count).mockResolvedValue(1);

      // Mock TMDB API
      nock('https://api.themoviedb.org')
        .get('/3/movie/550')
        .query(true)
        .reply(200, {
          id: 550,
          title: 'Fight Club',
          overview: 'Movie overview',
          poster_path: '/poster.jpg',
          release_date: '1999-10-15',
        });

      const result = await favoriteListService.getFavorites(userId, pagination);

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toHaveProperty('id', 550);
      expect(result.results[0]).toHaveProperty('title', 'Fight Club');
      expect(result.total_results).toBe(1);
    });
  });

  describe('addFavorite', () => {
    it('should add movie to existing favorite list', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.favoriteListMovie.create).mockResolvedValue({
        id: 1,
        favoriteListId: mockFavoriteList.id,
        tmdbMovieId: movieData.tmdbMovieId,
        addedAt: new Date(),
      });

      // Mock TMDB API
      nock('https://api.themoviedb.org')
        .get(`/3/movie/${movieData.tmdbMovieId}`)
        .query(true)
        .reply(200, {
          id: 550,
          title: 'Fight Club',
          overview: 'Movie overview',
          poster_path: '/poster.jpg',
          release_date: '1999-10-15',
        });

      const result = await favoriteListService.addFavorite(userId, movieData);

      expect(result).toEqual({
        message: 'Movie added to favorites',
      });

      expect(vi.mocked(prisma.favoriteList.findUnique)).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(vi.mocked(prisma.favoriteListMovie.findUnique)).toHaveBeenCalledWith({
        where: {
          favoriteListId_tmdbMovieId: {
            favoriteListId: mockFavoriteList.id,
            tmdbMovieId: movieData.tmdbMovieId,
          },
        },
      });
      expect(vi.mocked(prisma.favoriteListMovie.create)).toHaveBeenCalledWith({
        data: {
          favoriteListId: mockFavoriteList.id,
          tmdbMovieId: movieData.tmdbMovieId,
        },
      });
    });

    it('should create new favorite list and add movie if none exists', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.favoriteList.create).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.favoriteListMovie.create).mockResolvedValue({
        id: 1,
        favoriteListId: mockFavoriteList.id,
        tmdbMovieId: movieData.tmdbMovieId,
        addedAt: new Date(),
      });

      // Mock TMDB API
      nock('https://api.themoviedb.org')
        .get(`/3/movie/${movieData.tmdbMovieId}`)
        .query(true)
        .reply(200, {
          id: 550,
          title: 'Fight Club',
          overview: 'Movie overview',
          poster_path: '/poster.jpg',
          release_date: '1999-10-15',
        });

      const result = await favoriteListService.addFavorite(userId, movieData);

      expect(result).toEqual({
        message: 'Movie added to favorites',
      });

      expect(vi.mocked(prisma.favoriteList.create)).toHaveBeenCalledWith({
        data: {
          userId,
          shareToken: expect.any(String),
        },
      });
    });

    it('should throw error when movie is already in favorites', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      const existingFavoriteMovie = {
        id: 1,
        favoriteListId: mockFavoriteList.id,
        tmdbMovieId: movieData.tmdbMovieId,
        addedAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.findUnique).mockResolvedValue(existingFavoriteMovie);

      await expect(favoriteListService.addFavorite(userId, movieData)).rejects.toThrow(
        'Movie already in favorites'
      );

      expect(vi.mocked(prisma.favoriteListMovie.create)).not.toHaveBeenCalled();
    });
  });

  describe('removeFavorite', () => {
    it('should remove movie from favorites successfully', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      const favoriteMovieToDelete = {
        id: 1,
        favoriteListId: mockFavoriteList.id,
        tmdbMovieId: movieData.tmdbMovieId,
        addedAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.findUnique).mockResolvedValue(favoriteMovieToDelete);
      vi.mocked(prisma.favoriteListMovie.deleteMany).mockResolvedValue({ count: 1 });

      const result = await favoriteListService.removeFavorite(userId, movieData);

      expect(result).toEqual({
        message: 'Movie removed from favorites',
      });

      expect(vi.mocked(prisma.favoriteList.findUnique)).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(vi.mocked(prisma.favoriteListMovie.deleteMany)).toHaveBeenCalledWith({
        where: {
          favoriteListId: mockFavoriteList.id,
          tmdbMovieId: movieData.tmdbMovieId,
        },
      });
    });

    it('should throw error when favorite list not found', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(null);

      await expect(favoriteListService.removeFavorite(userId, movieData)).rejects.toThrow(
        'Favorite list not found'
      );

      expect(vi.mocked(prisma.favoriteListMovie.findUnique)).not.toHaveBeenCalled();
      expect(vi.mocked(prisma.favoriteListMovie.deleteMany)).not.toHaveBeenCalled();
    });

    it('should remove movie even if not found in favorites (deleteMany handles this)', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.deleteMany).mockResolvedValue({ count: 0 });

      const result = await favoriteListService.removeFavorite(userId, movieData);

      expect(result).toEqual({
        message: 'Movie removed from favorites',
      });

      expect(vi.mocked(prisma.favoriteList.findUnique)).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(vi.mocked(prisma.favoriteListMovie.deleteMany)).toHaveBeenCalledWith({
        where: {
          favoriteListId: mockFavoriteList.id,
          tmdbMovieId: movieData.tmdbMovieId,
        },
      });
    });
  });

  describe('checkFavorite', () => {
    it('should return true when movie is in favorites', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      const existingFavoriteMovie = {
        id: 1,
        favoriteListId: mockFavoriteList.id,
        tmdbMovieId: movieData.tmdbMovieId,
        addedAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.findUnique).mockResolvedValue(existingFavoriteMovie);

      const result = await favoriteListService.checkFavorite(userId, movieData);

      expect(result).toEqual({ isFavorite: true });
    });

    it('should return false when movie is not in favorites', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.findUnique).mockResolvedValue(null);

      const result = await favoriteListService.checkFavorite(userId, movieData);

      expect(result).toEqual({ isFavorite: false });
    });

    it('should return false when favorite list not found', async () => {
      const userId = 1;
      const movieData = { tmdbMovieId: 550 };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(null);

      const result = await favoriteListService.checkFavorite(userId, movieData);

      expect(result).toEqual({ isFavorite: false });
    });
  });

  describe('generateShareToken', () => {
    it('should generate new share token for existing favorite list', async () => {
      const userId = 1;

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'old-token',
        createdAt: new Date(),
      };

      const updatedFavoriteList = {
        ...mockFavoriteList,
        shareToken: 'new-token',
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteList.update).mockResolvedValue(updatedFavoriteList);

      const result = await favoriteListService.generateShareToken(userId);

      expect(result).toEqual({ shareToken: updatedFavoriteList.shareToken });

      expect(vi.mocked(prisma.favoriteList.findUnique)).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(vi.mocked(prisma.favoriteList.update)).toHaveBeenCalledWith({
        where: { id: mockFavoriteList.id },
        data: { shareToken: expect.any(String) },
      });
    });

    it('should create new favorite list and generate token if none exists', async () => {
      const userId = 1;

      const mockFavoriteList = {
        id: 1,
        userId,
        shareToken: 'new-token',
        createdAt: new Date(),
      };

      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.favoriteList.create).mockResolvedValue(mockFavoriteList);

      const result = await favoriteListService.generateShareToken(userId);

      expect(result).toEqual({ shareToken: mockFavoriteList.shareToken });

      expect(vi.mocked(prisma.favoriteList.findUnique)).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(vi.mocked(prisma.favoriteList.create)).toHaveBeenCalledWith({
        data: {
          userId,
          shareToken: expect.any(String),
        },
      });
      expect(vi.mocked(prisma.favoriteList.update)).not.toHaveBeenCalled();
    });
  });
});