import { Router } from 'express';
import { pagoController } from '../controllers/pago.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', pagoController.registrar);
router.get('/cliente/:clienteId', pagoController.getByCliente);
router.delete('/:id', pagoController.delete);

export default router;
