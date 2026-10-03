import { prisma } from '../config/prisma';

export class UsuarioRepository {
  async findByUsername(username: string) {
    return prisma.usuario.findUnique({
      where: { username },
    });
  }

  async findById(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
    });
  }

  /**
   * Guarda el nuevo hash e incrementa tokenVersion en la misma operación,
   * así todos los JWT emitidos con la contraseña anterior dejan de valer.
   */
  async updatePasswordAndRevokeTokens(id: number, passwordHash: string) {
    return prisma.usuario.update({
      where: { id },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
      },
    });
  }
}
export const usuarioRepository = new UsuarioRepository();
