import { clienteRepository } from '../repositories/cliente.repository';
import { configService } from './config.service';
import { clasificarCliente } from '../utils/clasificacion.utils';
import { getBillingDate, normalizeDate } from '../utils/fecha.utils';

export class DashboardService {
  async getDashboardData(referenceDateInput?: Date) {
    const today = referenceDateInput ? normalizeDate(referenceDateInput) : normalizeDate(new Date());
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1; // 1-indexed

    // Fetch config
    const config = await configService.getConfig();
    const umbral = config.umbralAlertaDias;

    // Fetch all active clients along with their payments for this month
    const clients = await clienteRepository.findActiveWithPaymentsForPeriod(currentMonth, currentYear);

    let totalClientesActivos = clients.length;
    let clientesAlDia = 0;
    let clientesConDeuda = 0;
    let ingresosCobradosMesActual = 0;

    const cobrarHoyList: any[] = [];
    const proximosVencerList: any[] = [];
    const conDeudaList: any[] = [];

    for (const client of clients) {
      const hasPaid = client.pagos.length > 0;
      const estado = clasificarCliente(client.fechaAlta, hasPaid, today, umbral);

      // Sum collected revenue
      if (hasPaid) {
        ingresosCobradosMesActual += client.pagos.reduce((sum: number, p: { monto: any }) => sum + Number(p.monto), 0);
      }

      // Calculate exact billing date for this month
      const billingDate = getBillingDate(client.fechaAlta, currentYear, currentMonth);

      const clientInfo = {
        id: client.id,
        nombre: client.nombre,
        dni: client.dni,
        telefono: client.telefono,
        fechaAlta: client.fechaAlta,
        fechaVencimiento: billingDate,
      };

      switch (estado) {
        case 'AL_DIA':
          clientesAlDia++;
          break;
        case 'COBRAR_HOY':
          cobrarHoyList.push(clientInfo);
          clientesConDeuda++; // Cobrar hoy is unpaid and due today
          break;
        case 'PROXIMO_A_VENCER':
          proximosVencerList.push(clientInfo);
          clientesAlDia++; // Still "al dia" until actual billing day, or maybe not.
          break;
        case 'CON_DEUDA':
          conDeudaList.push(clientInfo);
          clientesConDeuda++;
          break;
      }
    }

    // Double check: Clientes al día are those who paid.
    clientesAlDia = clients.filter((c: any) => c.pagos.length > 0).length;

    return {
      indicadores: {
        totalClientesActivos,
        clientesAlDia,
        clientesConDeuda,
        ingresosCobradosMesActual,
      },
      listas: {
        cobrarHoy: cobrarHoyList.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        proximosVencer: proximosVencerList.sort((a, b) => a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime()),
        conDeuda: conDeudaList.sort((a, b) => a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime()),
      },
    };
  }
}
export const dashboardService = new DashboardService();
