import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class PagoRepository {
  async create(data: {
    clienteId: number;
    fechaPago: Date;
    monto: number;
    periodoMes: number;
    periodoAnio: number;
    medioPago?: string | null;
  }) {
    return prisma.pago.create({
      data: {
        clienteId: data.clienteId,
        fechaPago: data.fechaPago,
        monto: new Prisma.Decimal(data.monto),
        periodoMes: data.periodoMes,
        periodoAnio: data.periodoAnio,
        medioPago: data.medioPago ?? null,
      },
    });
  }

  async findById(id: number) {
    return prisma.pago.findUnique({
      where: { id },
      include: { cliente: true },
    });
  }

  async findByClienteId(clienteId: number) {
    return prisma.pago.findMany({
      where: { clienteId },
      orderBy: [
        { periodoAnio: 'desc' },
        { periodoMes: 'desc' },
      ],
    });
  }

  async findUnique(clienteId: number, periodoMes: number, periodoAnio: number) {
    return prisma.pago.findUnique({
      where: {
        clienteId_periodoMes_periodoAnio: {
          clienteId,
          periodoMes,
          periodoAnio,
        },
      },
    });
  }

  async update(id: number, data: {
    fechaPago?: Date;
    monto?: number;
    periodoMes?: number;
    periodoAnio?: number;
    medioPago?: string | null;
  }) {
    return prisma.pago.update({
      where: { id },
      data: {
        ...(data.fechaPago !== undefined && { fechaPago: data.fechaPago }),
        ...(data.monto !== undefined && { monto: new Prisma.Decimal(data.monto) }),
        ...(data.periodoMes !== undefined && { periodoMes: data.periodoMes }),
        ...(data.periodoAnio !== undefined && { periodoAnio: data.periodoAnio }),
        ...(data.medioPago !== undefined && { medioPago: data.medioPago }),
      },
    });
  }

  async delete(id: number) {
    return prisma.pago.delete({
      where: { id },
    });
  }

  async sumMontoByPeriod(month: number, year: number): Promise<number> {
    const aggregate = await prisma.pago.aggregate({
      where: {
        periodoMes: month,
        periodoAnio: year,
      },
      _sum: {
        monto: true,
      },
    });
    return aggregate._sum.monto ? aggregate._sum.monto.toNumber() : 0;
  }

  async getIngresosMensualesGroupByPeriod(limitMonths: number = 12) {
    const groups = await prisma.pago.groupBy({
      by: ['periodoAnio', 'periodoMes'],
      _sum: { monto: true },
      orderBy: [
        { periodoAnio: 'desc' },
        { periodoMes: 'desc' },
      ],
      take: limitMonths,
    });

    return groups.map((g: { periodoAnio: number; periodoMes: number; _sum: { monto: Prisma.Decimal | null } }) => ({
      anio: g.periodoAnio,
      mes: g.periodoMes,
      total: g._sum.monto ? g._sum.monto.toNumber() : 0,
    }));
  }

  /**
   * Retorna todos los pagos de un período con los datos del cliente.
   * Usado en el drill-down de Reportes.
   */
  async findByPeriod(mes: number, anio: number) {
    return prisma.pago.findMany({
      where: { periodoMes: mes, periodoAnio: anio },
      include: {
        cliente: {
          select: { id: true, nombre: true, dni: true, telefono: true },
        },
      },
      orderBy: { fechaPago: 'asc' },
    });
  }
}
export const pagoRepository = new PagoRepository();
