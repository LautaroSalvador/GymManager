import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { dashboardQuerySchema } from '../validators/dashboard.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const dashboardController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const { date } = dashboardQuerySchema.parse(req.query);
    const referenceDate = date ? new Date(date) : undefined;
    const data = await dashboardService.getDashboardData(referenceDate);
    res.status(200).json({ success: true, data });
  }),
};
