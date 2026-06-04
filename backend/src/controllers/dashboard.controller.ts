import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      let referenceDate: Date | undefined = undefined;
      if (req.query.date) {
        referenceDate = new Date(req.query.date as string);
        if (isNaN(referenceDate.getTime())) {
          referenceDate = undefined;
        }
      }

      const data = await dashboardService.getDashboardData(referenceDate);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
export const dashboardController = new DashboardController();
