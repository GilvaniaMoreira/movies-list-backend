import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger';

export const validateSchema = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Validation error:', errorMessages);
        res.status(400).json({ 
          error: 'Validation failed', 
          details: errorMessages 
        });
        return;
      }
      
      logger.error('Schema validation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
