import { api } from './api';
import type { Cliente, ClienteConEstado } from '../types/cliente.types';

export const clienteService = {
  async getAll(params?: { activo?: boolean; search?: string }): Promise<Cliente[]> {
    const query = new URLSearchParams();
    if (params?.activo !== undefined) {
      query.set('activo', String(params.activo));
    }
    if (params?.search) {
      query.set('search', params.search);
    }
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<Cliente[]>(`/clientes${queryString}`);
  },

  async getConEstado(): Promise<ClienteConEstado[]> {
    return api.get<ClienteConEstado[]>('/clientes/con-estado');
  },

  async getById(id: number): Promise<Cliente> {
    return api.get<Cliente>(`/clientes/${id}`);
  },

  async create(data: { nombre: string; dni?: string | null; telefono?: string | null; fechaAlta: string }): Promise<Cliente> {
    return api.post<Cliente>('/clientes', data);
  },

  async update(id: number, data: Partial<{ nombre: string; dni: string | null; telefono: string | null; calle: string | null; altura: string | null; fechaAlta: string; activo: boolean }>): Promise<Cliente> {
    return api.put<Cliente>(`/clientes/${id}`, data);
  },
};
