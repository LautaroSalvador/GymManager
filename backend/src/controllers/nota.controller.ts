import { Request, Response, NextFunction } from 'express';
import { notaService } from '../services/nota.service';
import { createNotaSchema } from '../validators/nota.validator';
import { AppError } from '../utils/errors';

export class NotaController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const clienteId = parseInt(req.params.clienteId, 10);
      if (isNaN(clienteId)) {
        throw new AppError('Invalid client ID', 400);
      }

      const { texto } = createNotaSchema.parse(req.body);
      const data = await notaService.crearNota(clienteId, texto);

      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid note ID', 400);
      }

      await notaService.eliminarNota(id);

      return res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const clienteId = parseInt(req.params.clienteId, 10);
      if (isNaN(clienteId)) {
        throw new AppError('Invalid client ID', 400);
      }

      const data = await notaService.getNotasByCliente(clienteId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
export const notaController = new NotaController();
