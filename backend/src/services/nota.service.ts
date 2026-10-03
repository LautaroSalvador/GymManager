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
    const nota = await notaRepository.findById(id);
    if (!nota) {
      throw new AppError('Note not found', 404);
    }
    return notaRepository.delete(id);
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
