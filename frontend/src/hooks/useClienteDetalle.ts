import { useCallback } from 'react';
import { clienteService } from '../services/cliente.service';
import { pagoService } from '../services/pago.service';
import { notaService } from '../services/nota.service';
import { useApiData } from './useApiData';

export function useClienteDetalle(id: number) {
  const fetchCliente = useCallback(() => clienteService.getById(id), [id]);
  const fetchPagos = useCallback(() => pagoService.getByCliente(id), [id]);
  const fetchNotas = useCallback(() => notaService.getByCliente(id), [id]);

  const cliente = useApiData(fetchCliente, 'Error al cargar el cliente');
  const pagos = useApiData(fetchPagos, 'Error al cargar los pagos');
  const notas = useApiData(fetchNotas, 'Error al cargar las notas');

  // Spinner de página solo en la primera carga (o al pasar a otro cliente);
  // las recargas posteriores mantienen los datos en pantalla.
  const loading = cliente.loading && cliente.data?.id !== id;

  const { refresh: refreshCliente } = cliente;
  const { refresh: refreshPagosOnly } = pagos;
  const { refresh: refreshNotas } = notas;

  const refresh = useCallback(() => {
    refreshCliente();
    refreshPagosOnly();
    refreshNotas();
  }, [refreshCliente, refreshPagosOnly, refreshNotas]);

  // Recarga pagos y también el cliente: su estado de deuda depende de los pagos.
  const refreshPagos = useCallback(() => {
    refreshCliente();
    refreshPagosOnly();
  }, [refreshCliente, refreshPagosOnly]);

  return {
    cliente: cliente.data,
    pagos: pagos.data ?? [],
    notas: notas.data ?? [],
    loading,
    error: cliente.error ?? pagos.error ?? notas.error,
    refresh,
    refreshPagos,
    refreshNotas,
    // Recarga solo el cliente (ej: tras darlo de baja o reactivarlo, cambia su estado de deuda)
    refreshCliente,
  };
}
