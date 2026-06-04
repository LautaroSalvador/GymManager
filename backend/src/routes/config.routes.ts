import { Router } from 'express';
import { configController } from '../controllers/config.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', configController.get);
router.put('/', configController.update);

export default router;
