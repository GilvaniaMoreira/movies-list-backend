import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { hashPassword, comparePassword } from '../../src/utils/hash';
import { generateToken, verifyToken } from '../../src/utils/jwt';
import prisma from '../../src/config/prisma';
import nock from 'nock';

// Mock de utils
vi.mock('../../src/utils/hash');
vi.mock('../../src/utils/jwt');

const mockHashPassword = vi.mocked(hashPassword);
const mockComparePassword = vi.mocked(comparePassword);
const mockGenerateToken = vi.mocked(generateToken);
const mockVerifyToken = vi.mocked(verifyToken);

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nock.cleanAll(); // Limpar nock antes de cada teste
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
  });

  it('should return API message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Movie List API is running!');
  });

  describe('Auth Routes', () => {
    it('should return 400 for invalid registration data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };
      const response = await request(app).post('/api/auth/register').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 for missing required fields', async () => {
      const missingData = {
        name: 'Test User',
      };
      const response = await request(app).post('/api/auth/register').send(missingData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 for invalid login data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };
      const response = await request(app).post('/api/auth/login').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('Protected Routes', () => {
    it('should return 401 when accessing protected route without token', async () => {
      const response = await request(app).get('/api/auth/profile');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 403 when accessing protected route with invalid token', async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app).get('/api/auth/profile').set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should return 401 when accessing favorites without token', async () => {
      const response = await request(app).get('/api/favorites');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 401 when accessing user profile without token', async () => {
      const response = await request(app).get('/api/users/profile');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('Success Cases with Valid Tokens', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFavoriteList = {
        id: 1,
        userId: 1,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      // Mock de Prisma
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
      vi.mocked(prisma.favoriteList.create).mockResolvedValue(mockFavoriteList);

      // Mock de utils
      mockHashPassword.mockResolvedValue('hashedpassword');
      mockGenerateToken.mockReturnValue('jwt-token');

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        data: {
          message: 'User registered successfully',
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
          },
          token: 'jwt-token',
        },
      });
    });

    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: loginData.email,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login successful',
        data: {
          message: 'Login successful',
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
          },
          token: 'jwt-token',
        },
      });
    });

    it('should get user profile with valid token', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock de JWT
      mockVerifyToken.mockReturnValue({ id: 1, email: 'test@example.com' });

      // Mock de Prisma
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Profile retrieved successfully',
        data: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          createdAt: mockUser.createdAt.toISOString(),
          updatedAt: mockUser.updatedAt.toISOString(),
        },
      });
    });

    it('should get favorites with valid token', async () => {
      const mockFavoriteList = {
        id: 1,
        userId: 1,
        shareToken: 'abc123',
        createdAt: new Date(),
      };
      const mockFavoriteMovies = [
        {
          id: 1,
          favoriteListId: 1,
          tmdbMovieId: 550,
          addedAt: new Date(),
        },
      ];

      // Mock de JWT
      mockVerifyToken.mockReturnValue({ id: 1, email: 'test@example.com' });

      // Mock de Prisma
      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue({
        ...mockFavoriteList,
        movies: mockFavoriteMovies,
      });
      vi.mocked(prisma.favoriteListMovie.count).mockResolvedValue(1);

      // Mock de API TMDB
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

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data.results).toBeInstanceOf(Array);
      expect(response.body.data.results[0]).toHaveProperty('id', 550);
      expect(response.body.data.results[0]).toHaveProperty('title', 'Fight Club');
    });

    it('should add movie to favorites with valid token', async () => {
      const movieData = { tmdbMovieId: 550 };

      const mockFavoriteList = {
        id: 1,
        userId: 1,
        shareToken: 'abc123',
        createdAt: new Date(),
      };

      // Mock de JWT
      mockVerifyToken.mockReturnValue({ id: 1, email: 'test@example.com' });

      // Mock de Prisma
      vi.mocked(prisma.favoriteList.findUnique).mockResolvedValue(mockFavoriteList);
      vi.mocked(prisma.favoriteListMovie.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.favoriteListMovie.create).mockResolvedValue({
        id: 1,
        favoriteListId: 1,
        tmdbMovieId: 550,
        addedAt: new Date(),
      });

      // Mock de API TMDB
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

      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', 'Bearer valid-token')
        .send(movieData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Movie added to favorites',
      });
    });

    it('should validate data format with valid token', async () => {
      const validToken = 'valid-jwt-token';

      mockVerifyToken.mockReturnValue({ id: 1, email: 'test@example.com' });

      const invalidData = { tmdbMovieId: 'invalid' };

      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData)
        .expect(400); // Should fail validation, not auth

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('TMDB Integration Tests', () => {
    it('should handle TMDB API calls', async () => {
      // Mock TMDB API response
      nock('https://api.themoviedb.org')
        .get('/3/movie/550')
        .query(true)
        .reply(200, {
          id: 550,
          title: 'Fight Club',
          overview: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more.',
          poster_path: '/pB8BM7pdXLXbAFz4SFXE6NugWFK.jpg',
          release_date: '1999-10-15',
        });

      const response = await request(app)
        .get('/api/movies/550')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 550);
      expect(response.body.data).toHaveProperty('title', 'Fight Club');
    });

    it('should handle TMDB search', async () => {
      // Mock TMDB API response
      nock('https://api.themoviedb.org')
        .get('/3/search/movie')
        .query(true)
        .reply(200, {
          page: 1,
          results: [
            {
              id: 550,
              title: 'Fight Club',
              overview: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more.',
              poster_path: '/pB8BM7pdXLXbAFz4SFXE6NugWFK.jpg',
              release_date: '1999-10-15',
            },
          ],
          total_pages: 1,
          total_results: 1,
        });

      const response = await request(app)
        .get('/api/movies/search?query=Fight Club')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data.results).toBeInstanceOf(Array);
      expect(response.body.data.results[0]).toHaveProperty('title', 'Fight Club');
    });
  });
});