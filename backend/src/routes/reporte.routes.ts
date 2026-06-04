import { Router } from 'express';
import { reporteController } from '../controllers/reporte.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', reporteController.get);
router.get('/pagos/:anio/:mes', reporteController.getPagosPorMes);

export default router;
