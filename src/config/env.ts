import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // TMDB API
  TMDB_API_KEY: process.env.TMDB_API_KEY!,
  TMDB_BASE_URL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
} as const;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'TMDB_API_KEY'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
