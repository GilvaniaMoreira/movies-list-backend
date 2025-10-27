import express from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateSchema } from '../../middlewares/validateSchema';
import { updateProfileSchema } from './user.schema';

const router = express.Router();
const userController = new UserController();

// Todas as rotas exigem autenticação
router.get('/profile', authMiddleware, userController.getProfile.bind(userController));
router.put('/profile', authMiddleware, validateSchema(updateProfileSchema), userController.updateProfile.bind(userController));
router.delete('/profile', authMiddleware, userController.deleteUser.bind(userController));

export default router;
