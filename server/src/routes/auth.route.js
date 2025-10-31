import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const authController = new AuthController();
const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

export default router;

