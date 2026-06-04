import { Router } from 'express';
import authRoutes from './auth.routes';
import clienteRoutes from './cliente.routes';
import pagoRoutes from './pago.routes';
import notaRoutes from './nota.routes';
import configRoutes from './config.routes';
import dashboardRoutes from './dashboard.routes';
import reporteRoutes from './reporte.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pagos', pagoRoutes);
router.use('/notas', notaRoutes);
router.use('/config', configRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reportes', reporteRoutes);

export default router;
