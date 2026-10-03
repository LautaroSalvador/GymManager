import { useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { useApiData } from './useApiData';

export function useDashboard() {
  const fetchDashboard = useCallback(() => dashboardService.get(), []);
  const { data, loading, error, refresh } = useApiData(fetchDashboard, 'Error al cargar el dashboard');
  return { data, loading, error, refresh };
}
