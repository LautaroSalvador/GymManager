import { Request, Response, NextFunction } from 'express';
import { configService } from '../services/config.service';
import { updateConfigSchema } from '../validators/config.validator';

export class ConfigController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await configService.getConfig();
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { precioCuota, umbralAlertaDias } = updateConfigSchema.parse(req.body);
      const data = await configService.updateConfig(precioCuota, umbralAlertaDias);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
export const configController = new ConfigController();
