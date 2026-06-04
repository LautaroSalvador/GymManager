import { api } from './api';
import type { DashboardData } from '../types/dashboard.types';

export const dashboardService = {
  async get(date?: string): Promise<DashboardData> {
    const url = date ? `/dashboard?date=${date}` : '/dashboard';
    return api.get<DashboardData>(url);
  },
};
