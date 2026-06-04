import { prisma } from '../config/prisma';

export class ConfigRepository {
  async getVal(clave: string): Promise<string | null> {
    const config = await prisma.configuracion.findUnique({
      where: { clave },
    });
    return config ? config.valor : null;
  }

  async setVal(clave: string, valor: string) {
    return prisma.configuracion.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor },
    });
  }

  async getAll() {
    return prisma.configuracion.findMany();
  }
}
export const configRepository = new ConfigRepository();
