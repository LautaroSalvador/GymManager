import type { Pago } from './pago.types';

export type ClienteEstado = 'AL_DIA' | 'COBRAR_HOY' | 'PROXIMO_A_VENCER' | 'CON_DEUDA';

export interface Nota {
  id: number;
  clienteId: number;
  texto: string;
  createdAt: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  fechaAlta: string; // ISO format date string
  activo: boolean;
  createdAt: string; // ISO format timestamp
  notas?: Nota[];
  pagos?: Pago[];
}

/** Cliente activo con estado de pago del mes actual */
export interface ClienteConEstado {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  fechaAlta: string;
  activo: boolean;
  estado: ClienteEstado;
}
