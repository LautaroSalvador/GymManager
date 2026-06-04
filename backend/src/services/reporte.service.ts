import { pagoRepository } from '../repositories/pago.repository';
import { clienteRepository } from '../repositories/cliente.repository';
import { configService } from './config.service';
import { normalizeDate } from '../utils/fecha.utils';

export class ReporteService {
  async getReportesData() {
    const today = normalizeDate(new Date());
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1;

    // 1. Resumen del mes actual
    const config = await configService.getConfig();
    const precioCuota = config.precioCuota;

    const activeClients = await clienteRepository.findAll({ activo: true });
    const totalClientesActivos = activeClients.length;

    const totalEsperado = totalClientesActivos * precioCuota;
    const totalCobrado = await pagoRepository.sumMontoByPeriod(currentMonth, currentYear);

    // Clients who paid this month
    const activeClientsWithPayments = await clienteRepository.findActiveWithPaymentsForPeriod(
      currentMonth,
      currentYear
    );
    const clientesPagadosCount = activeClientsWithPayments.filter((c: any) => c.pagos.length > 0).length;

    const tasaCobranza = totalClientesActivos > 0 ? (clientesPagadosCount / totalClientesActivos) * 100 : 0;

    // 2. Ingresos mensuales (últimos 12 meses)
    // We get groups from DB, then fill missing months with 0
    const ingresosDb = await pagoRepository.getIngresosMensualesGroupByPeriod(12);
    const ingresosMensuales = this.fillLast12Months(today, ingresosDb, 'total');

    // 3. Clientes activos en el tiempo (últimos 12 meses)
    // For each of the last 12 months, we count how many active clients have fechaAlta <= end of that month
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

  private fillLast12Months(today: Date, dbData: any[], valueKey: string) {
    const result = [];
    const tempDate = new Date(today.getTime());

    for (let i = 0; i < 12; i++) {
      const year = tempDate.getUTCFullYear();
      const month = tempDate.getUTCMonth() + 1; // 1-indexed

      const dbMatch = dbData.find((d: any) => d.anio === year && d.mes === month);
      const val = dbMatch ? dbMatch[valueKey] : 0;

      result.unshift({
        anio: year,
        mes: month,
        label: `${this.getMesAbreviado(month)} ${year}`,
        valor: val,
      });

      // Move to previous month
      tempDate.setUTCMonth(tempDate.getUTCMonth() - 1);
    }

    return result;
  }

  private getEvolucionClientesActivos(activeClients: any[], today: Date) {
    const result = [];
    const tempDate = new Date(today.getTime());

    for (let i = 0; i < 12; i++) {
      const year = tempDate.getUTCFullYear();
      const month = tempDate.getUTCMonth() + 1;

      // End of target month
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      // Count active clients whose fechaAlta <= end of this target month
      const count = activeClients.filter((c: any) => {
        const fechaAlta = new Date(c.fechaAlta);
        return fechaAlta <= endOfMonth;
      }).length;

      result.unshift({
        anio: year,
        mes: month,
        label: `${this.getMesAbreviado(month)} ${year}`,
        valor: count,
      });

      tempDate.setUTCMonth(tempDate.getUTCMonth() - 1);
    }

    return result;
  }

  /**
   * Devuelve los clientes que pagaron en un período específico.
   * Usado en el drill-down del gráfico de ingresos.
   */
  async getPagosPorMes(mes: number, anio: number) {
    const pagos = await pagoRepository.findByPeriod(mes, anio);
    return pagos.map((p: any) => ({
      id: p.id,
      monto: parseFloat(p.monto.toString()),
      fechaPago: p.fechaPago,
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
