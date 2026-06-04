import { api } from './api';

export interface ReporteResumen {
  totalCobrado: number;
  totalEsperado: number;
  tasaCobranza: number;
  clientesPagados: number;
  clientesActivos: number;
}

export interface ReporteHistoricoItem {
  anio: number;
  mes: number;
  label: string;
  valor: number;
}

export interface ReporteData {
  resumenMesActual: ReporteResumen;
  ingresosMensuales: ReporteHistoricoItem[];
  clientesActivosEvolucion: ReporteHistoricoItem[];
}

export interface PagoDelMes {
  id: number;
  monto: number;
  fechaPago: string;
  medioPago: string | null;
  cliente: {
    id: number;
    nombre: string;
    dni: string | null;
    telefono: string | null;
  };
}

export const reporteService = {
  async get(): Promise<ReporteData> {
    return api.get<ReporteData>('/reportes');
  },

  async getPagosPorMes(anio: number, mes: number): Promise<PagoDelMes[]> {
    return api.get<PagoDelMes[]>(`/reportes/pagos/${anio}/${mes}`);
  },
};
