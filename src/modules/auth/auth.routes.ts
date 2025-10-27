import express from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateSchema } from '../../middlewares/validateSchema';
import { registerSchema, loginSchema } from './auth.schema';

const router = express.Router();
const authController = new AuthController();

// Rotas públicas
router.post('/register', validateSchema(registerSchema), authController.register.bind(authController));
router.post('/login', validateSchema(loginSchema), authController.login.bind(authController));

// Rotas protegidas
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));

export default router;
