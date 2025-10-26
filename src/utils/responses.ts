import { Response } from 'express';

export const successResponse = (res: Response, statusCode: number, message: string, data?: any) => {
  return res.status(statusCode).json({
    message,
    ...(data && { data }),
  });
};

export const errorResponse = (res: Response, statusCode: number, message: string, error?: any) => {
  return res.status(statusCode).json({
    error: message,
    ...(error && { details: error }),
  });
};