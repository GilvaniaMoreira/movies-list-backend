import express from 'express';
import { TMDBController } from './tmdb.controller';

const router = express.Router();
const tmdbController = new TMDBController();

// Buscar filmes
router.get('/search', tmdbController.searchMovies.bind(tmdbController));

// Obter filmes populares
router.get('/popular', tmdbController.getPopularMovies.bind(tmdbController));

// Obter detalhes do filme
router.get('/:id', tmdbController.getMovieDetails.bind(tmdbController));

export default router;
