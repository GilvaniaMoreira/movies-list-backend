import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Unhandled error:', err);
  
  // Não vazar detalhes do erro em produção
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;
    
  res.status(500).json({ error: message });
};
