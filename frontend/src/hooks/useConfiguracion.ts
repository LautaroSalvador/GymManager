import { useState, useEffect, useCallback } from 'react';
import { configService } from '../services/config.service';
import type { Configuration } from '../services/config.service';

export function useConfiguracion() {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await configService.get();
      setConfig(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar configuración';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { config, setConfig, loading, error, refresh: load };
}
