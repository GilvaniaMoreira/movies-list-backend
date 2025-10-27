import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// Importar rotas
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import favoriteListRoutes from './modules/favoriteList/favoriteList.routes';
import tmdbRoutes from './modules/tmdb/tmdb.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteListRoutes);
app.use('/api/movies', tmdbRoutes);

// Endpoint de health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota de teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Movie List API is running!' });
});

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
