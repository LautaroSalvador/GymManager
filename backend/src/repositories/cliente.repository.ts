import { prisma } from '../config/prisma';
import { CreateClienteData, UpdateClienteData } from '../types/cliente.types';
import { Prisma } from '@prisma/client';

export class ClienteRepository {
  async create(data: CreateClienteData) {
    return prisma.cliente.create({
      data: {
        nombre: data.nombre,
        dni: data.dni,
        telefono: data.telefono,
        calle: data.calle,
        altura: data.altura,
        fechaAlta: data.fechaAlta,
        activo: true,
      },
    });
  }

  async update(
    id: number,
    data: UpdateClienteData
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
   * Busca un cliente activo con ese DNI, opcionalmente excluyendo un id
   * (para no chocar consigo mismo al editar).
   */
  async findActiveByDni(dni: string, excludeId?: number) {
    return prisma.cliente.findFirst({
      where: {
        dni,
        activo: true,
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
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
