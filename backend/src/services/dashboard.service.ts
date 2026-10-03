import { clienteRepository } from '../repositories/cliente.repository';
import { configService } from './config.service';
import { clasificarCliente } from '../utils/clasificacion.utils';
import { getBillingDate, normalizeDate } from '../utils/fecha.utils';

interface DashboardCliente {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  fechaAlta: Date;
  fechaVencimiento: Date;
}

const byNombre = (a: DashboardCliente, b: DashboardCliente) => a.nombre.localeCompare(b.nombre);
const byVencimiento = (a: DashboardCliente, b: DashboardCliente) =>
  a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime();

export class DashboardService {
  async getDashboardData(referenceDateInput?: Date) {
    const today = referenceDateInput ? normalizeDate(referenceDateInput) : normalizeDate(new Date());
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1; // 1-indexed

    const config = await configService.getConfig();
    const umbral = config.umbralAlertaDias;

    // Clientes activos con sus pagos del mes actual
    const clients = await clienteRepository.findActiveWithPaymentsForPeriod(currentMonth, currentYear);

    let ingresosCobradosMesActual = 0;
    const cobrarHoy: DashboardCliente[] = [];
    const proximosVencer: DashboardCliente[] = [];
    const conDeuda: DashboardCliente[] = [];

    for (const client of clients) {
      const hasPaid = client.pagos.length > 0;
      const estado = clasificarCliente(client.fechaAlta, hasPaid, today, umbral);

      ingresosCobradosMesActual += client.pagos.reduce((sum, pago) => sum + pago.monto.toNumber(), 0);

      const clientInfo: DashboardCliente = {
        id: client.id,
        nombre: client.nombre,
        dni: client.dni,
        telefono: client.telefono,
        fechaAlta: client.fechaAlta,
        fechaVencimiento: getBillingDate(client.fechaAlta, currentYear, currentMonth),
      };

      if (estado === 'COBRAR_HOY') cobrarHoy.push(clientInfo);
      if (estado === 'PROXIMO_A_VENCER') proximosVencer.push(clientInfo);
      if (estado === 'CON_DEUDA') conDeuda.push(clientInfo);
    }

    // Los indicadores coinciden con las listas: cada cliente activo está en
    // exactamente uno de estos grupos → al día + cobrar hoy + con deuda = total.
    // "Al día" incluye a los próximos a vencer: todavía no deben nada.
    const totalClientesActivos = clients.length;
    const clientesConDeuda = conDeuda.length;
    const clientesAlDia = totalClientesActivos - cobrarHoy.length - clientesConDeuda;

    return {
      indicadores: {
        totalClientesActivos,
        clientesAlDia,
        clientesConDeuda,
        ingresosCobradosMesActual,
      },
      listas: {
        cobrarHoy: cobrarHoy.sort(byNombre),
        proximosVencer: proximosVencer.sort(byVencimiento),
        conDeuda: conDeuda.sort(byVencimiento),
      },
    };
  }
}
export const dashboardService = new DashboardService();
