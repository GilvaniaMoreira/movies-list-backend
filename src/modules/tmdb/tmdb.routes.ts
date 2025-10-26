import express from 'express';
import { TMDBController } from './tmdb.controller';

const router = express.Router();
const tmdbController = new TMDBController();

// Search movies
router.get('/search', tmdbController.searchMovies.bind(tmdbController));

// Get popular movies
router.get('/popular', tmdbController.getPopularMovies.bind(tmdbController));

// Get movie details
router.get('/:id', tmdbController.getMovieDetails.bind(tmdbController));

export default router;
