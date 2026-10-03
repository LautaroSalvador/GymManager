import { Request, Response } from 'express';
import { configService } from '../services/config.service';
import { updateConfigSchema } from '../validators/config.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const configController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    const data = await configService.getConfig();
    res.status(200).json({ success: true, data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { precioCuota, umbralAlertaDias } = updateConfigSchema.parse(req.body);
    const data = await configService.updateConfig(precioCuota, umbralAlertaDias);
    res.status(200).json({ success: true, data });
  }),
};
