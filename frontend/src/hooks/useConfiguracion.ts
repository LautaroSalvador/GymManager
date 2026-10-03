import { useCallback } from 'react';
import { configService } from '../services/config.service';
import { useApiData } from './useApiData';

export function useConfiguracion() {
  const fetchConfig = useCallback(() => configService.get(), []);
  const { data, setData, loading, error, refresh } = useApiData(fetchConfig, 'Error al cargar configuración');
  return { config: data, setConfig: setData, loading, error, refresh };
}
