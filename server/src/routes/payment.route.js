import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const paymentController = new PaymentController();
const router = Router();

router.post('/create-order', verifyToken, paymentController.createOrder);
router.post('/verify', verifyToken, paymentController.verifyPayment);
router.get('/status', verifyToken, paymentController.getSubscriptionStatus);

export default router;

