import { api } from './api';
import type { Pago } from '../types/pago.types';

export const pagoService = {
  async registrar(data: {
    clienteId: number;
    fechaPago: string;
    monto: number;
    periodoMes: number;
    periodoAnio: number;
    medioPago?: string | null;
  }): Promise<Pago> {
    return api.post<Pago>('/pagos', data);
  },

  async getByCliente(clienteId: number): Promise<Pago[]> {
    return api.get<Pago[]>(`/pagos/cliente/${clienteId}`);
  },

  async delete(id: number): Promise<void> {
    await api.delete<void>(`/pagos/${id}`);
  },
};
