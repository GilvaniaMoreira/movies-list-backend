import express from 'express';
import { favoriteController } from '../controllers/favoriteController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes except shared list require authentication
router.get('/', authenticateToken, favoriteController.getFavorites);
router.post('/', authenticateToken, favoriteController.addFavorite);
router.delete('/:tmdbMovieId', authenticateToken, favoriteController.removeFavorite);
router.get('/check/:tmdbMovieId', authenticateToken, favoriteController.checkFavorite);
router.post('/share-token', authenticateToken, favoriteController.generateShareToken);

// Public route for viewing shared lists
router.get('/share/:shareToken', favoriteController.getSharedList);

export default router;

