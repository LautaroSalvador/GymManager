import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class ClienteRepository {
  async create(data: { nombre: string; dni?: string | null; telefono?: string | null; fechaAlta: Date }) {
    return prisma.cliente.create({
      data: {
        nombre: data.nombre,
        dni: data.dni,
        telefono: data.telefono,
        fechaAlta: data.fechaAlta,
        activo: true,
      },
    });
  }

  async update(
    id: number,
    data: { nombre?: string; dni?: string | null; telefono?: string | null; fechaAlta?: Date; activo?: boolean }
  ) {
    return prisma.cliente.update({
      where: { id },
      data,
    });
  }

  async findById(id: number) {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        notas: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findAll(options?: { activo?: boolean; search?: string }) {
    const where: Prisma.ClienteWhereInput = {};

    if (options?.activo !== undefined) {
      where.activo = options.activo;
    }

    if (options?.search) {
      where.nombre = {
        contains: options.search,
        mode: 'insensitive',
      };
    }

    return prisma.cliente.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Finds all active clients and includes their payments for a specific period
   * (month and year) to help with dashboard classification.
   */
  async findActiveWithPaymentsForPeriod(month: number, year: number) {
    return prisma.cliente.findMany({
      where: { activo: true },
      include: {
        pagos: {
          where: {
            periodoMes: month,
            periodoAnio: year,
          },
        },
      },
    });
  }
}
export const clienteRepository = new ClienteRepository();
