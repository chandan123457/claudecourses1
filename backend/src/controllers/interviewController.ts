import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { asyncHandler, AppError, handleValidationErrors } from '../middlewares/errorHandler';
import { interviewService } from '../services/interviewService';
import logger from '../utils/logger';

export const interviewController = {
  // GET /interviews
  getInterviewData: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const data = await interviewService.getInterviewData(userId);
    res.status(200).json({ success: true, data });
  }),

  // POST /interviews/book
  bookInterview: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { domain, preferredDate } = req.body;

    if (!domain || !preferredDate) {
      throw new AppError('Domain and preferred date are required', 400);
    }

    const booking = await interviewService.bookInterview(
      userId,
      domain,
      new Date(preferredDate)
    );

    logger.info('Interview booked', { userId, domain, preferredDate });

    res.status(201).json({
      success: true,
      message: 'Interview session booked successfully',
      data: booking,
    });
  }),

  // DELETE /interviews/bookings/:id
  cancelBooking: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const bookingId = parseInt(req.params.id);

    await interviewService.cancelBooking(bookingId, userId);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  }),
};

export const validateBooking = [
  body('domain').notEmpty().withMessage('Domain is required'),
  body('preferredDate').isISO8601().withMessage('Valid date is required'),
  handleValidationErrors,
];
