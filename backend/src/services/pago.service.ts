import { pagoRepository } from '../repositories/pago.repository';
import { clienteRepository } from '../repositories/cliente.repository';
import { AppError } from '../utils/errors';

export class PagoService {
  async registrarPago(data: {
    clienteId: number;
    fechaPago: Date;
    monto: number;
    periodoMes: number;
    periodoAnio: number;
    medioPago?: string | null;
  }) {
    const client = await clienteRepository.findById(data.clienteId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    if (!client.activo) {
      throw new AppError('Cannot record payment for an inactive client', 400);
    }

    // Check for double payment for the same period
    const existing = await pagoRepository.findUnique(
      data.clienteId,
      data.periodoMes,
      data.periodoAnio
    );
    if (existing) {
      throw new AppError(
        `Payment already recorded for client in period ${data.periodoMes}/${data.periodoAnio}`,
        400
      );
    }

    return pagoRepository.create(data);
  }

  async getPagosByCliente(clienteId: number) {
    const client = await clienteRepository.findById(clienteId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    return pagoRepository.findByClienteId(clienteId);
  }

  async eliminarPago(id: number) {
    const payment = await pagoRepository.findById(id);
    if (!payment) {
      throw new AppError('Payment record not found', 404);
    }
    return pagoRepository.delete(id);
  }
}
export const pagoService = new PagoService();
