import { prisma } from '../config/prisma';

export class NotaRepository {
  async create(clienteId: number, texto: string) {
    return prisma.nota.create({
      data: {
        clienteId,
        texto,
      },
    });
  }

  async findByClienteId(clienteId: number) {
    return prisma.nota.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: number) {
    return prisma.nota.delete({
      where: { id },
    });
  }
}
export const notaRepository = new NotaRepository();
