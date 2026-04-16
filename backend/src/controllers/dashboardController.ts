import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { dashboardService } from '../services/dashboardService';

export const dashboardController = {
  getDashboard: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const data = await dashboardService.getDashboardData(userId);

    res.status(200).json({
      success: true,
      data,
    });
  }),
};
