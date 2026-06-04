import { Cliente } from '@prisma/client';
import { clienteRepository } from '../repositories/cliente.repository';
import { configService } from './config.service';
import { clasificarCliente } from '../utils/clasificacion.utils';
import { normalizeDate } from '../utils/fecha.utils';
import { AppError } from '../utils/errors';

export class ClienteService {
  async createCliente(data: { nombre: string; dni?: string | null; telefono?: string | null; fechaAlta: Date }) {
    if (data.dni) {
      const activeClients = await clienteRepository.findAll({ activo: true });
      const dup = activeClients.find((c: Cliente) => c.dni === data.dni);
      if (dup) {
        throw new AppError(`Client with DNI ${data.dni} already exists as an active client`, 400);
      }
    }
    return clienteRepository.create(data);
  }

  async updateCliente(
    id: number,
    data: { nombre?: string; dni?: string | null; telefono?: string | null; fechaAlta?: Date; activo?: boolean }
  ) {
    const client = await clienteRepository.findById(id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    if (data.dni && data.dni !== client.dni) {
      const activeClients = await clienteRepository.findAll({ activo: true });
      const dup = activeClients.find((c: Cliente) => c.dni === data.dni && c.id !== id);
      if (dup) {
        throw new AppError(`Client with DNI ${data.dni} already exists`, 400);
      }
    }

    return clienteRepository.update(id, data);
  }

  async getClienteById(id: number) {
    const client = await clienteRepository.findById(id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    return client;
  }

  async getAllClientes(options?: { activo?: boolean; search?: string }) {
    return clienteRepository.findAll(options);
  }

  /**
   * Devuelve todos los clientes activos con su estado de pago del mes actual.
   * Estado: AL_DIA | COBRAR_HOY | PROXIMO_A_VENCER | CON_DEUDA
   */
  async getAllClientesConEstado() {
    const today = normalizeDate(new Date());
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1;

    const config = await configService.getConfig();
    const umbral = config.umbralAlertaDias;

    const clients = await clienteRepository.findActiveWithPaymentsForPeriod(currentMonth, currentYear);

    return clients.map((c: any) => {
      const hasPaid = c.pagos.length > 0;
      const estado = clasificarCliente(c.fechaAlta, hasPaid, today, umbral);
      return {
        id: c.id,
        nombre: c.nombre,
        dni: c.dni,
        telefono: c.telefono,
        fechaAlta: c.fechaAlta,
        activo: c.activo,
        estado,
      };
    });
  }
}
export const clienteService = new ClienteService();
