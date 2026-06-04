import { api } from './api';
import type { Nota } from '../types/cliente.types';

export const notaService = {
  async create(clienteId: number, texto: string): Promise<Nota> {
    return api.post<Nota>(`/notas/cliente/${clienteId}`, { texto });
  },

  async getByCliente(clienteId: number): Promise<Nota[]> {
    return api.get<Nota[]>(`/notas/cliente/${clienteId}`);
  },

  async delete(id: number): Promise<void> {
    await api.delete<void>(`/notas/${id}`);
  },
};
