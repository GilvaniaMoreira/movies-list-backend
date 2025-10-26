export interface TMDBMovie {
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
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string }>;
  budget?: number;
  revenue?: number;
}

export interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  budget: number;
  revenue: number;
}
