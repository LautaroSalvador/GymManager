import { api } from './api';

export interface Configuration {
  precioCuota: number;
  umbralAlertaDias: number;
}

export const configService = {
  async get(): Promise<Configuration> {
    return api.get<Configuration>('/config');
  },

  async update(precioCuota: number, umbralAlertaDias: number): Promise<Configuration> {
    return api.put<Configuration>('/config', { precioCuota, umbralAlertaDias });
  },
};
