export interface DashboardCliente {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  fechaAlta: string;
  /** Vencimiento del mes actual o, si tiene deuda, del mes impago más viejo. */
  fechaVencimiento: string;
  mesesAdeudados: number;
}

export interface DashboardData {
  indicadores: {
    totalClientesActivos: number;
    clientesAlDia: number;
    clientesConDeuda: number;
    ingresosCobradosMesActual: number;
  };
  listas: {
    cobrarHoy: DashboardCliente[];
    proximosVencer: DashboardCliente[];
    conDeuda: DashboardCliente[];
  };
}
