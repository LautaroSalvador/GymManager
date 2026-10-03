import { Request, Response } from 'express';
import { pagoService } from '../services/pago.service';
import { createPagoSchema, updatePagoSchema } from '../validators/pago.validator';
import { idParamSchema, clienteIdParamSchema } from '../validators/common.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const pagoController = {
  registrar: asyncHandler(async (req: Request, res: Response) => {
    const body = createPagoSchema.parse(req.body);
    const data = await pagoService.registrarPago(body);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updatePagoSchema.parse(req.body);
    const data = await pagoService.actualizarPago(id, body);
    res.status(200).json({ success: true, data });
  }),

  getByCliente: asyncHandler(async (req: Request, res: Response) => {
    const { clienteId } = clienteIdParamSchema.parse(req.params);
    const data = await pagoService.getPagosByCliente(clienteId);
    res.status(200).json({ success: true, data });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await pagoService.eliminarPago(id);
    res.status(200).json({ success: true, message: 'Payment record deleted successfully' });
  }),
};
