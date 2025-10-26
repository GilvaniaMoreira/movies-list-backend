import axios from 'axios';
import { env } from '../../config/env';
import { SearchMoviesInput, MovieDetailsInput, PopularMoviesInput } from './tmdb.schema';
import { TMDBResponse, TMDBMovieDetails } from './tmdb.types';

export class TMDBService {
  async searchMovies(data: SearchMoviesInput): Promise<TMDBResponse> {
    const { query, page } = data;

    const response = await axios.get(`${env.TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: env.TMDB_API_KEY,
        query,
        page,
        language: 'pt-BR',
      },
    });

    const movies = response.data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      backdrop_path: movie.backdrop_path,
    }));

    return {
      results: movies,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
      page,
    };
  }

  async getMovieDetails(data: MovieDetailsInput): Promise<TMDBMovieDetails> {
    const { id } = data;

    const response = await axios.get(`${env.TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: env.TMDB_API_KEY,
        language: 'pt-BR',
      },
    });

    return {
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
  }

  async getPopularMovies(data: PopularMoviesInput): Promise<TMDBResponse> {
    const { page } = data;

    const response = await axios.get(`${env.TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: env.TMDB_API_KEY,
        page,
        language: 'pt-BR',
      },
    });

    const movies = response.data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      backdrop_path: movie.backdrop_path,
    }));

    return {
      results: movies,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
      page,
    };
  }
}
