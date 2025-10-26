import express from 'express';
import { FavoriteListController } from './favoriteList.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateSchema } from '../../middlewares/validateSchema';
import { addFavoriteSchema } from './favoriteList.schema';

const router = express.Router();
const favoriteListController = new FavoriteListController();

// All routes except shared list require authentication
router.get('/', authMiddleware, favoriteListController.getFavorites.bind(favoriteListController));
router.post('/', authMiddleware, validateSchema(addFavoriteSchema), favoriteListController.addFavorite.bind(favoriteListController));
router.delete('/:tmdbMovieId', authMiddleware, favoriteListController.removeFavorite.bind(favoriteListController));
router.get('/check/:tmdbMovieId', authMiddleware, favoriteListController.checkFavorite.bind(favoriteListController));
router.post('/share-token', authMiddleware, favoriteListController.generateShareToken.bind(favoriteListController));

// Public route for viewing shared lists
router.get('/share/:shareToken', favoriteListController.getSharedList.bind(favoriteListController));

export default router;
