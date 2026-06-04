import { configRepository } from '../repositories/config.repository';

export class ConfigService {
  async getConfig() {
    const precioCuotaStr = await configRepository.getVal('precio_cuota');
    const umbralAlertaDiasStr = await configRepository.getVal('umbral_alerta_dias');

    return {
      precioCuota: precioCuotaStr ? parseFloat(precioCuotaStr) : 15000,
      umbralAlertaDias: umbralAlertaDiasStr ? parseInt(umbralAlertaDiasStr, 10) : 3,
    };
  }

  async updateConfig(precioCuota: number, umbralAlertaDias: number) {
    await configRepository.setVal('precio_cuota', precioCuota.toString());
    await configRepository.setVal('umbral_alerta_dias', umbralAlertaDias.toString());

    return {
      precioCuota,
      umbralAlertaDias,
    };
  }
}
export const configService = new ConfigService();
