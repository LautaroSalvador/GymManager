import { prisma } from '../config/prisma';

export class UsuarioRepository {
  async findByUsername(username: string) {
    return prisma.usuario.findUnique({
      where: { username },
    });
  }

  async updatePassword(id: number, passwordHash: string) {
    return prisma.usuario.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
export const usuarioRepository = new UsuarioRepository();
