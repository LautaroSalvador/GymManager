import { useState, useEffect, useCallback } from 'react';
import { reporteService } from '../services/reporte.service';
import type { ReporteData } from '../services/reporte.service';

export function useReportes() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reporteService.get();
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar reportes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
