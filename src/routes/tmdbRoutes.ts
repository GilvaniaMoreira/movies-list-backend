import express from 'express';
import { tmdbController } from '../controllers/tmdbController';

const router = express.Router();

// Search movies
router.get('/search', tmdbController.searchMovies);

// Get popular movies
router.get('/popular', tmdbController.getPopularMovies);

// Get movie details
router.get('/:id', tmdbController.getMovieDetails);

export default router;

