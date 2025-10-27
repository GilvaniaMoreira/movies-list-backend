import express from 'express';
import { FavoriteListController } from './favoriteList.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateSchema } from '../../middlewares/validateSchema';
import { addFavoriteSchema } from './favoriteList.schema';

const router = express.Router();
const favoriteListController = new FavoriteListController();

// Todas as rotas, exceto a lista compartilhada, exigem autenticação
router.get('/', authMiddleware, favoriteListController.getFavorites.bind(favoriteListController));
router.post('/', authMiddleware, validateSchema(addFavoriteSchema), favoriteListController.addFavorite.bind(favoriteListController));
router.delete('/:tmdbMovieId', authMiddleware, favoriteListController.removeFavorite.bind(favoriteListController));
router.get('/check/:tmdbMovieId', authMiddleware, favoriteListController.checkFavorite.bind(favoriteListController));
router.post('/share-token', authMiddleware, favoriteListController.generateShareToken.bind(favoriteListController));

// Rota pública para visualizar listas compartilhadas
router.get('/share/:shareToken', favoriteListController.getSharedList.bind(favoriteListController));

export default router;
