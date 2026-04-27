import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { asyncHandler, AppError, handleValidationErrors } from '../middlewares/errorHandler';
import { programService } from '../services/programService';
import logger from '../utils/logger';

export const programController = {
  // GET /programs
  getPrograms: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { domain, level, duration, search, page, limit } = req.query;

    const result = await programService.getPrograms({
      domain: domain as string,
      level: level as string,
      duration: duration as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 9,
      userId: req.user?.id,
    });

    res.status(200).json({ success: true, ...result });
  }),

  // GET /programs/filters
  getFilterOptions: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const options = await programService.getFilterOptions();
    res.status(200).json({ success: true, data: options });
  }),

  // GET /programs/:id
  getProgramById: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const program = await programService.getProgramById(id);
    if (!program) throw new AppError('Program not found', 404);
    res.status(200).json({ success: true, data: program });
  }),

  // POST /programs/enroll
  enroll: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { programId } = req.body;
    if (!programId) throw new AppError('programId is required', 400);

    const enrollment = await programService.enrollUser(userId, parseInt(programId));
    logger.info('User enrolled in program', { userId, programId });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment,
    });
  }),

  // PATCH /programs/:id/progress
  updateProgress: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const programId = parseInt(req.params.id);
    const { progress, currentModule } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      throw new AppError('Progress must be between 0 and 100', 400);
    }

    const enrollment = await programService.updateProgress(userId, programId, progress, currentModule);
    res.status(200).json({ success: true, data: enrollment });
  }),

  // GET /programs/my-enrollments
  getMyEnrollments: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const enrollments = await programService.getUserEnrollments(userId);
    res.status(200).json({ success: true, data: enrollments });
  }),

  // GET /programs/:id/content
  getProgramContent: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const programId = parseInt(req.params.id);
    const userId = req.user!.id;
    const data = await programService.getProgramContent(programId, userId);
    if (!data) throw new AppError('Not enrolled or program not found', 403);
    res.status(200).json({ success: true, data });
  }),

  // GET /programs/lessons/:lessonId
  getLesson: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user!.id;
    const data = await programService.getLessonById(lessonId, userId);
    if (!data) throw new AppError('Lesson not found or not enrolled', 403);
    res.status(200).json({ success: true, data });
  }),

  // POST /programs/lessons/:lessonId/complete
  markLessonComplete: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user!.id;
    const { completed } = req.body;
    const result = await programService.markLessonComplete(userId, lessonId, completed !== false);
    res.status(200).json({ success: true, data: result });
  }),

  // POST /programs/assignments/:assignmentId/submit
  submitAssignment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const assignmentId = parseInt(req.params.assignmentId);
    const userId = req.user!.id;
    const data = await programService.submitAssignment(userId, assignmentId, {
      githubLink: req.body.githubLink,
      file: req.file,
    });
    res.status(201).json({ success: true, message: 'Assignment submitted successfully', data });
  }),

  // POST /programs/payment/create-order
  createPaymentOrder: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || null;
    const { programId } = req.body;
    if (!programId) throw new AppError('programId is required', 400);
    const order = await programService.createProgramOrder(userId, parseInt(programId));
    res.status(201).json({ success: true, data: order });
  }),

  // POST /programs/payment/verify
  verifyPayment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) throw new AppError('orderId, paymentId, and signature are required', 400);
    const result = await programService.verifyProgramPayment(orderId, paymentId, signature);
    res.status(200).json({ success: true, data: result });
  }),

  // POST /programs/payment/claim
  claimPayment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { token } = req.body;
    if (!token) throw new AppError('token is required', 400);

    const enrollment = await programService.claimPaidProgramOrder(userId, token);
    logger.info('User claimed paid program order', { userId, programId: enrollment.programId });

    res.status(200).json({
      success: true,
      message: 'Program purchase linked successfully',
      data: enrollment,
    });
  }),
};

export const validateProgram = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('domain').notEmpty().withMessage('Domain is required'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Level must be Beginner, Intermediate, or Advanced'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('instructor').notEmpty().withMessage('Instructor is required'),
  handleValidationErrors,
];
