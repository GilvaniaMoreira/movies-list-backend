import { z } from 'zod';

export const searchMoviesSchema = z.object({
  query: z.string().min(1, 'Query parameter is required'),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
});

export const movieDetailsSchema = z.object({
  id: z.string().transform(val => parseInt(val)),
});

export const popularMoviesSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
});

export type SearchMoviesInput = z.infer<typeof searchMoviesSchema>;
export type MovieDetailsInput = z.infer<typeof movieDetailsSchema>;
export type PopularMoviesInput = z.infer<typeof popularMoviesSchema>;
