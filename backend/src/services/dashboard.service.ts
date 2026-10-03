import { clienteRepository } from '../repositories/cliente.repository';
import { pagoRepository } from '../repositories/pago.repository';
import { configService } from './config.service';
import { clasificarCliente } from '../utils/clasificacion.utils';
import { getBillingDate, getToday, normalizeDate, toPeriodo } from '../utils/fecha.utils';

interface DashboardCliente {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  fechaAlta: Date;
  /** Vencimiento del mes actual o, si tiene deuda, del mes impago más viejo. */
  fechaVencimiento: Date;
  mesesAdeudados: number;
}

const byNombre = (a: DashboardCliente, b: DashboardCliente) => a.nombre.localeCompare(b.nombre);
const byVencimiento = (a: DashboardCliente, b: DashboardCliente) =>
  a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime();

export class DashboardService {
  async getDashboardData(referenceDateInput?: Date) {
    const today = referenceDateInput ? normalizeDate(referenceDateInput) : getToday();
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1; // 1-indexed

    const config = await configService.getConfig();
    const umbral = config.umbralAlertaDias;

    // Clientes activos con los períodos de todos sus pagos
    const clients = await clienteRepository.findActiveWithPeriodosPagados();

    const cobrarHoy: DashboardCliente[] = [];
    const proximosVencer: DashboardCliente[] = [];
    const conDeuda: DashboardCliente[] = [];

    for (const client of clients) {
      const { estado, mesesAdeudados } = clasificarCliente({
        fechaAlta: client.fechaAlta,
        fechaReactivacion: client.fechaReactivacion,
        periodosPagados: client.pagos.map(toPeriodo),
        today,
        umbralDias: umbral,
      });

      const periodoVencimiento = mesesAdeudados[0] ?? { anio: currentYear, mes: currentMonth };

      const clientInfo: DashboardCliente = {
        id: client.id,
        nombre: client.nombre,
        dni: client.dni,
        telefono: client.telefono,
        fechaAlta: client.fechaAlta,
        fechaVencimiento: getBillingDate(client.fechaAlta, periodoVencimiento.anio, periodoVencimiento.mes),
        mesesAdeudados: mesesAdeudados.length,
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

    // Igual que en Reportes: todo lo cobrado del mes, sin importar el estado actual del cliente.
    const ingresosCobradosMesActual = await pagoRepository.sumMontoByPeriod(currentMonth, currentYear);

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
        // El que debe desde hace más tiempo, primero
        conDeuda: conDeuda.sort(byVencimiento),
      },
    };
  }
}
export const dashboardService = new DashboardService();
