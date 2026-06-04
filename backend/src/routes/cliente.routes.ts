import { Router } from 'express';
import { clienteController } from '../controllers/cliente.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', clienteController.create);
router.get('/con-estado', clienteController.getConEstado);
router.put('/:id', clienteController.update);
router.get('/:id', clienteController.getById);
router.get('/', clienteController.getAll);

export default router;
