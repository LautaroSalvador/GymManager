import { Request, Response } from 'express';
import { reporteService } from '../services/reporte.service';
import { pagosPorMesParamsSchema } from '../validators/reporte.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const reporteController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    const data = await reporteService.getReportesData();
    res.status(200).json({ success: true, data });
  }),

  getPagosPorMes: asyncHandler(async (req: Request, res: Response) => {
    const { mes, anio } = pagosPorMesParamsSchema.parse(req.params);
    const data = await reporteService.getPagosPorMes(mes, anio);
    res.status(200).json({ success: true, data });
  }),
};
