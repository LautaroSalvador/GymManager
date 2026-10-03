import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginRateLimitGlobal, loginRateLimitPorIp } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/login', loginRateLimitGlobal, loginRateLimitPorIp, authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.use(authMiddleware);
router.post('/change-password', authController.changePassword);
router.get('/me', authController.me);

export default router;
