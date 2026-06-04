import { Router } from 'express';
import { notaController } from '../controllers/nota.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/cliente/:clienteId', notaController.create);
router.get('/cliente/:clienteId', notaController.getByCliente);
router.delete('/:id', notaController.delete);

export default router;
