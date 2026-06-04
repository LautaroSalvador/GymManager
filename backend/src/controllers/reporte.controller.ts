import { Request, Response, NextFunction } from 'express';
import { reporteService } from '../services/reporte.service';
import { AppError } from '../utils/errors';

export class ReporteController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reporteService.getReportesData();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getPagosPorMes(req: Request, res: Response, next: NextFunction) {
    try {
      const mes = parseInt(req.params.mes, 10);
      const anio = parseInt(req.params.anio, 10);

      if (isNaN(mes) || mes < 1 || mes > 12) {
        throw new AppError('Mes inválido (1-12)', 400);
      }
      if (isNaN(anio) || anio < 2000) {
        throw new AppError('Año inválido', 400);
      }

      const data = await reporteService.getPagosPorMes(mes, anio);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
export const reporteController = new ReporteController();
