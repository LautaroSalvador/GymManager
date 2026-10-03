import { CreateClienteData, UpdateClienteData } from '../types/cliente.types';
import { clienteRepository } from '../repositories/cliente.repository';
import { configService } from './config.service';
import { clasificarCliente } from '../utils/clasificacion.utils';
import { getToday } from '../utils/fecha.utils';
import { AppError } from '../utils/errors';

export class ClienteService {
  async createCliente(data: CreateClienteData) {
    if (data.dni) {
      const duplicate = await clienteRepository.findActiveByDni(data.dni);
      if (duplicate) {
        throw new AppError(`Ya existe un cliente activo con DNI ${data.dni}`, 400);
      }
    }
    return clienteRepository.create(data);
  }

  async updateCliente(
    id: number,
    data: UpdateClienteData
  ) {
    const client = await clienteRepository.findById(id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    if (data.dni && data.dni !== client.dni) {
      const duplicate = await clienteRepository.findActiveByDni(data.dni, id);
      if (duplicate) {
        throw new AppError(`Ya existe un cliente activo con DNI ${data.dni}`, 400);
      }
    }

    return clienteRepository.update(id, {
      ...data,
      ...this.getFechasCambioDeEstado(client.activo, data.activo),
    });
  }

  /**
   * Registra la fecha de baja o de reactivación cuando cambia `activo`.
   * La fecha de baja se conserva al reactivar para poder reconstruir el historial.
   */
  private getFechasCambioDeEstado(
    activoActual: boolean,
    activoNuevo: boolean | undefined
  ): { fechaBaja?: Date; fechaReactivacion?: Date } {
    if (activoNuevo === undefined || activoNuevo === activoActual) {
      return {};
    }
    return activoNuevo ? { fechaReactivacion: getToday() } : { fechaBaja: getToday() };
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
    const today = getToday();
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1;

    const config = await configService.getConfig();
    const umbral = config.umbralAlertaDias;

    const clients = await clienteRepository.findActiveWithPaymentsForPeriod(currentMonth, currentYear);

    return clients.map((c) => {
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
