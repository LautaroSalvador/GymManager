import { useState, useEffect, useCallback } from 'react';
import { clienteService } from '../services/cliente.service';
import { pagoService } from '../services/pago.service';
import { notaService } from '../services/nota.service';
import type { Cliente, Nota } from '../types/cliente.types';
import type { Pago } from '../types/pago.types';

export function useClienteDetalle(id: number) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clienteData, pagosData, notasData] = await Promise.all([
        clienteService.getById(id),
        pagoService.getByCliente(id),
        notaService.getByCliente(id),
      ]);
      setCliente(clienteData);
      setPagos(pagosData);
      setNotas(notasData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar el cliente';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshPagos = useCallback(async () => {
    try {
      const data = await pagoService.getByCliente(id);
      setPagos(data);
    } catch {
      // silently fail on partial refresh
    }
  }, [id]);

  const refreshNotas = useCallback(async () => {
    try {
      const data = await notaService.getByCliente(id);
      setNotas(data);
    } catch {
      // silently fail on partial refresh
    }
  }, [id]);

  return {
    cliente,
    pagos,
    notas,
    loading,
    error,
    refresh: load,
    refreshPagos,
    refreshNotas,
    setCliente,
  };
}
