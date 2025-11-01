import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const statsController = new StatsController();
const router = Router();

router.get('/', verifyToken, statsController.getStats);
router.post('/complete-exercise', verifyToken, statsController.completeExercise);

export default router;

