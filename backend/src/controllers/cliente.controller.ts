import { Request, Response, NextFunction } from 'express';
import { clienteService } from '../services/cliente.service';
import { createClienteSchema, updateClienteSchema } from '../validators/cliente.validator';
import { AppError } from '../utils/errors';

export class ClienteController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = createClienteSchema.parse(req.body);
      const data = await clienteService.createCliente(parsedBody);
      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const parsedBody = updateClienteSchema.parse(req.body);
      const data = await clienteService.updateCliente(id, parsedBody);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const data = await clienteService.getClienteById(id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      let activo: boolean | undefined = undefined;
      if (req.query.activo !== undefined) {
        activo = req.query.activo === 'true';
      }

      const search = req.query.search as string | undefined;

      const data = await clienteService.getAllClientes({ activo, search });
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  async getConEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await clienteService.getAllClientesConEstado();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
export const clienteController = new ClienteController();
