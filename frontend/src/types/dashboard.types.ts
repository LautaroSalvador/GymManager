export interface DashboardCliente {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  fechaAlta: string;
  fechaVencimiento: string;
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
