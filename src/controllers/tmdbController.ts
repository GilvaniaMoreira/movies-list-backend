import { Request, Response } from 'express';
import axios from 'axios';

const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  backdrop_path: string | null;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  production_companies?: Array<{ id: number; name: string; logo_path: string | null }>;
  budget?: number;
  revenue?: number;
}

export const tmdbController = {
  // Search movies in TMDb API
  searchMovies: async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, page = 1 } = req.query;

      if (!query) {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: query as string,
          page: page as string,
          language: 'pt-BR',
        },
      });

      const movies = response.data.results.map((movie: TMDBMovie) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        backdrop_path: movie.backdrop_path,
      }));

      res.json({
        results: movies,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
        page: parseInt(page as string),
      });
    } catch (error) {
      console.error('Error searching movies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get details of a specific movie
  getMovieDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
        },
      });

      const movie = {
        id: response.data.id,
        title: response.data.title,
        overview: response.data.overview,
        poster_path: response.data.poster_path,
        release_date: response.data.release_date,
        vote_average: response.data.vote_average,
        vote_count: response.data.vote_count,
        backdrop_path: response.data.backdrop_path,
        runtime: response.data.runtime,
        genres: response.data.genres,
        production_companies: response.data.production_companies,
        production_countries: response.data.production_countries,
        spoken_languages: response.data.spoken_languages,
        budget: response.data.budget,
        revenue: response.data.revenue,
      };

      res.json(movie);
    } catch (error) {
      console.error('Error getting movie details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get popular movies
  getPopularMovies: async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1 } = req.query;

      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          page: page as string,
          language: 'pt-BR',
        },
      });

      const movies = response.data.results.map((movie: TMDBMovie) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        backdrop_path: movie.backdrop_path,
      }));

      res.json({
        results: movies,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
        page: parseInt(page as string),
      });
    } catch (error) {
      console.error('Error getting popular movies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

