import { CreateClienteData, UpdateClienteData } from '../types/cliente.types';
import { clienteRepository } from '../repositories/cliente.repository';
import { pagoRepository } from '../repositories/pago.repository';
import { configService } from './config.service';
import { clasificarCliente } from '../utils/clasificacion.utils';
import { getToday, toPeriodo } from '../utils/fecha.utils';
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

  /**
   * Devuelve el cliente con sus notas y su estado de pago. Si está activo,
   * incluye los meses adeudados (actual y anteriores).
   */
  async getClienteById(id: number) {
    const client = await clienteRepository.findById(id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    if (!client.activo) {
      return { ...client, estado: null, mesesAdeudados: [] };
    }

    const [periodosPagados, config] = await Promise.all([
      pagoRepository.findPeriodosPagadosByCliente(id),
      configService.getConfig(),
    ]);

    const { estado, mesesAdeudados } = clasificarCliente({
      fechaAlta: client.fechaAlta,
      fechaReactivacion: client.fechaReactivacion,
      periodosPagados: periodosPagados.map(toPeriodo),
      today: getToday(),
      umbralDias: config.umbralAlertaDias,
    });

    return { ...client, estado, mesesAdeudados };
  }

  async getAllClientes(options?: { activo?: boolean; search?: string }) {
    return clienteRepository.findAll(options);
  }

  /**
   * Devuelve todos los clientes activos con su estado de pago.
   * Estado: AL_DIA | COBRAR_HOY | PROXIMO_A_VENCER | CON_DEUDA
   */
  async getAllClientesConEstado() {
    const today = getToday();
    const config = await configService.getConfig();
    const clients = await clienteRepository.findActiveWithPeriodosPagados();

    return clients.map((c) => {
      const { estado, mesesAdeudados } = clasificarCliente({
        fechaAlta: c.fechaAlta,
        fechaReactivacion: c.fechaReactivacion,
        periodosPagados: c.pagos.map(toPeriodo),
        today,
        umbralDias: config.umbralAlertaDias,
      });
      return {
        id: c.id,
        nombre: c.nombre,
        dni: c.dni,
        telefono: c.telefono,
        fechaAlta: c.fechaAlta,
        activo: c.activo,
        estado,
        mesesAdeudados,
      };
    });
  }
}
export const clienteService = new ClienteService();
