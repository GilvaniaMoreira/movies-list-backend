import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import favoriteListRoutes from './modules/favoriteList/favoriteList.routes';
import tmdbRoutes from './modules/tmdb/tmdb.routes';

const app = express();

// Middleware
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteListRoutes);
app.use('/api/movies', tmdbRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Movie List API is running!' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
