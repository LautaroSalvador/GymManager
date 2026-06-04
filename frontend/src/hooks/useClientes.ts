import { useState, useEffect, useCallback } from 'react';
import { clienteService } from '../services/cliente.service';
import type { Cliente } from '../types/cliente.types';

interface UseClientesOptions {
  activo?: boolean;
  search?: string;
}

export function useClientes(options: UseClientesOptions = {}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clienteService.getAll(options);
      setClientes(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar clientes';
      setError(message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.activo, options.search]);

  useEffect(() => {
    load();
  }, [load]);

  return { clientes, loading, error, refresh: load };
}
