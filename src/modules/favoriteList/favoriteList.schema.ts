import { z } from 'zod';

export const addFavoriteSchema = z.object({
  tmdbMovieId: z.number().int().positive('TMDB Movie ID must be a positive integer'),
});

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
});

export const movieIdSchema = z.object({
  tmdbMovieId: z.string().transform(val => parseInt(val)),
});

export const shareTokenSchema = z.object({
  shareToken: z.string().min(1, 'Share token is required'),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type MovieIdInput = z.infer<typeof movieIdSchema>;
export type ShareTokenInput = z.infer<typeof shareTokenSchema>;
