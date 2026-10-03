import type { Pago } from './pago.types';

export type ClienteEstado = 'AL_DIA' | 'COBRAR_HOY' | 'PROXIMO_A_VENCER' | 'CON_DEUDA';

/** Mes de cuota: mes 1-12 y año. */
export interface Periodo {
  anio: number;
  mes: number;
}

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
  calle: string | null;
  altura: string | null;
  fechaAlta: string; // ISO format date string
  activo: boolean;
  fechaBaja: string | null; // última baja
  fechaReactivacion: string | null; // última reactivación
  createdAt: string; // ISO format timestamp
  notas?: Nota[];
  pagos?: Pago[];
  /** Solo en el detalle: null si el cliente está inactivo. */
  estado?: ClienteEstado | null;
  /** Solo en el detalle: meses vencidos sin pagar, del más viejo al más nuevo. */
  mesesAdeudados?: Periodo[];
}

/** Cliente activo con estado de pago del mes actual */
export interface ClienteConEstado {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  calle: string | null;
  altura: string | null;
  fechaAlta: string;
  activo: boolean;
  estado: ClienteEstado;
  mesesAdeudados: Periodo[];
}

/** Elemento del listado de clientes: con estado de pago (activos) o sin él (inactivos/todos). */
export type ClienteListItem = Cliente | ClienteConEstado;

export function tieneEstado(cliente: ClienteListItem): cliente is ClienteConEstado {
  return 'estado' in cliente && cliente.estado !== null && cliente.estado !== undefined;
}
