import { notaRepository } from '../repositories/nota.repository';
import { clienteRepository } from '../repositories/cliente.repository';
import { AppError } from '../utils/errors';

export class NotaService {
  async crearNota(clienteId: number, texto: string) {
    const client = await clienteRepository.findById(clienteId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    return notaRepository.create(clienteId, texto);
  }

  async eliminarNota(id: number) {
    try {
      return await notaRepository.delete(id);
    } catch (e) {
      throw new AppError('Note not found', 404);
    }
  }

  async getNotasByCliente(clienteId: number) {
    const client = await clienteRepository.findById(clienteId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    return notaRepository.findByClienteId(clienteId);
  }
}
export const notaService = new NotaService();
