import { Request, Response, NextFunction } from 'express';
import { pagoService } from '../services/pago.service';
import { createPagoSchema, updatePagoSchema } from '../validators/pago.validator';
import { AppError } from '../utils/errors';

export class PagoController {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = createPagoSchema.parse(req.body);
      const data = await pagoService.registrarPago(parsedBody);
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
        throw new AppError('Invalid payment ID', 400);
      }
      const parsedBody = updatePagoSchema.parse(req.body);
      const data = await pagoService.actualizarPago(id, parsedBody);
      return res.status(200).json({
        success: true,
        data,
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

      const data = await pagoService.getPagosByCliente(clienteId);
      return res.status(200).json({
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
        throw new AppError('Invalid payment ID', 400);
      }

      await pagoService.eliminarPago(id);
      return res.status(200).json({
        success: true,
        message: 'Payment record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
export const pagoController = new PagoController();
