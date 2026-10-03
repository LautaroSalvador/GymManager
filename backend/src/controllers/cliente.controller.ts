import { Request, Response } from 'express';
import { clienteService } from '../services/cliente.service';
import {
  createClienteSchema,
  updateClienteSchema,
  listClientesQuerySchema,
} from '../validators/cliente.validator';
import { idParamSchema } from '../validators/common.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const clienteController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createClienteSchema.parse(req.body);
    const data = await clienteService.createCliente(body);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateClienteSchema.parse(req.body);
    const data = await clienteService.updateCliente(id, body);
    res.status(200).json({ success: true, data });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await clienteService.getClienteById(id);
    res.status(200).json({ success: true, data });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const filters = listClientesQuerySchema.parse(req.query);
    const data = await clienteService.getAllClientes(filters);
    res.status(200).json({ success: true, data });
  }),

  getConEstado: asyncHandler(async (_req: Request, res: Response) => {
    const data = await clienteService.getAllClientesConEstado();
    res.status(200).json({ success: true, data });
  }),
};
