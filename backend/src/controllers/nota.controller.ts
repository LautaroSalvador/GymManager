import { Request, Response } from 'express';
import { notaService } from '../services/nota.service';
import { createNotaSchema } from '../validators/nota.validator';
import { idParamSchema, clienteIdParamSchema } from '../validators/common.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const notaController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { clienteId } = clienteIdParamSchema.parse(req.params);
    const { texto } = createNotaSchema.parse(req.body);
    const data = await notaService.crearNota(clienteId, texto);
    res.status(201).json({ success: true, data });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await notaService.eliminarNota(id);
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  }),

  getByCliente: asyncHandler(async (req: Request, res: Response) => {
    const { clienteId } = clienteIdParamSchema.parse(req.params);
    const data = await notaService.getNotasByCliente(clienteId);
    res.status(200).json({ success: true, data });
  }),
};
