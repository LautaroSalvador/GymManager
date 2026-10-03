import { useCallback } from 'react';
import { reporteService } from '../services/reporte.service';
import { useApiData } from './useApiData';

export function useReportes() {
  const fetchReportes = useCallback(() => reporteService.get(), []);
  const { data, loading, error, refresh } = useApiData(fetchReportes, 'Error al cargar reportes');
  return { data, loading, error, refresh };
}
