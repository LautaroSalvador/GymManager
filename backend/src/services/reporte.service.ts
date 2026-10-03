import { Cliente } from '@prisma/client';
import { pagoRepository } from '../repositories/pago.repository';
import { clienteRepository } from '../repositories/cliente.repository';
import { configService } from './config.service';
import { getToday, getLastMonths } from '../utils/fecha.utils';

interface IngresoMensual {
  anio: number;
  mes: number;
  total: number;
}

interface PuntoHistorico {
  anio: number;
  mes: number;
  label: string;
  valor: number;
}

export class ReporteService {
  async getReportesData() {
    const today = getToday();
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1;

    // 1. Resumen del mes actual
    const config = await configService.getConfig();
    const precioCuota = config.precioCuota;

    const activeClients = await clienteRepository.findAll({ activo: true });
    const totalClientesActivos = activeClients.length;

    const totalEsperado = totalClientesActivos * precioCuota;

    // Tasa de cobranza: qué proporción de los clientes activos ya pagó el mes
    const activeClientsWithPayments = await clienteRepository.findActiveWithPaymentsForPeriod(
      currentMonth,
      currentYear
    );
    const clientesPagadosCount = activeClientsWithPayments.filter((c) => c.pagos.length > 0).length;

    // Total cobrado: todos los pagos del período, aunque el cliente se haya dado
    // de baja después. Así coincide con la barra del mes en el gráfico de ingresos.
    const totalCobrado = await pagoRepository.sumMontoByPeriod(currentMonth, currentYear);

    const tasaCobranza = totalClientesActivos > 0 ? (clientesPagadosCount / totalClientesActivos) * 100 : 0;

    // 2. Ingresos mensuales (últimos 12 meses), completando con 0 los meses sin pagos
    const ultimos12Meses = getLastMonths(today, 12);
    const ingresosDb = await pagoRepository.getIngresosMensuales(
      ultimos12Meses[0].anio,
      currentYear
    );
    const ingresosMensuales = this.fillLast12Months(today, ingresosDb);

    // 3. Clientes activos en el tiempo (últimos 12 meses)
    const clientesActivosEvolucion = this.getEvolucionClientesActivos(activeClients, today);

    return {
      resumenMesActual: {
        totalCobrado,
        totalEsperado,
        tasaCobranza: Math.round(tasaCobranza * 10) / 10,
        clientesPagados: clientesPagadosCount,
        clientesActivos: totalClientesActivos,
      },
      ingresosMensuales,
      clientesActivosEvolucion,
    };
  }

  private fillLast12Months(today: Date, ingresos: IngresoMensual[]): PuntoHistorico[] {
    return getLastMonths(today, 12).map(({ anio, mes }) => {
      const match = ingresos.find((d) => d.anio === anio && d.mes === mes);
      return {
        anio,
        mes,
        label: `${this.getMesAbreviado(mes)} ${anio}`,
        valor: match ? match.total : 0,
      };
    });
  }

  private getEvolucionClientesActivos(activeClients: Cliente[], today: Date): PuntoHistorico[] {
    return getLastMonths(today, 12).map(({ anio, mes }) => {
      // Último día del mes (las fechas @db.Date llegan a medianoche UTC)
      const endOfMonth = new Date(Date.UTC(anio, mes, 0));

      // Count active clients whose fechaAlta <= end of this target month
      const count = activeClients.filter((c) => c.fechaAlta <= endOfMonth).length;

      return {
        anio,
        mes,
        label: `${this.getMesAbreviado(mes)} ${anio}`,
        valor: count,
      };
    });
  }

  /**
   * Devuelve los clientes que pagaron en un período específico.
   * Usado en el drill-down del gráfico de ingresos.
   */
  async getPagosPorMes(mes: number, anio: number) {
    const pagos = await pagoRepository.findByPeriod(mes, anio);
    return pagos.map((p) => ({
      id: p.id,
      monto: p.monto.toNumber(),
      fechaPago: p.fechaPago,
      medioPago: p.medioPago,
      cliente: p.cliente,
    }));
  }

  private getMesAbreviado(mes: number): string {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return meses[mes - 1] || '';
  }
}
export const reporteService = new ReporteService();
