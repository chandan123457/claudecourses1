import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { asyncHandler, AppError, handleValidationErrors } from '../middlewares/errorHandler';
import { courseService } from '../services/courseService';
import { webinarService } from '../services/webinarService';
import { programService } from '../services/programService';
import { interviewService } from '../services/interviewService';
import { profileService } from '../services/profileService';
import logger from '../utils/logger';

// Simple admin authentication (in production, use proper JWT/session based auth)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'gradtopro2024';

export const adminController = {
  // Admin login
  login: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      throw new AppError('Invalid admin credentials', 401);
    }

    // Generate admin token (simple approach)
    const adminToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        token: adminToken,
        user: { username, role: 'admin' },
      },
    });
  }),

  // Get dashboard stats
  getDashboardStats: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const [courses, webinars] = await Promise.all([
      courseService.getAllCourses(),
      webinarService.getAllWebinars(),
    ]);

    const stats = {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.isActive).length,
      totalWebinars: webinars.length,
      activeWebinars: webinars.filter(w => w.isActive).length,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  }),

  // Course management
  createCourse: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Log the received data for debugging
    logger.info('Creating course with data:', req.body);

    const courseData = {
      title: req.body.title,
      image: req.body.image,
      description: req.body.description,
      syllabus: req.body.syllabus,
      teacher: req.body.teacher,
      price: parseInt(req.body.price),
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      telegram_link: req.body.telegramLink || undefined,
    };

    const course = await courseService.createCourse(courseData);

    logger.info('Course created by admin', { courseId: course.id, title: course.title });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  }),

  updateCourse: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.id);
    const updateData = {
      title: req.body.title,
      image: req.body.image,
      description: req.body.description,
      syllabus: req.body.syllabus,
      teacher: req.body.teacher,
      price: parseInt(req.body.price),
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      telegram_link: req.body.telegramLink || undefined,
      is_active: req.body.isActive,
    };

    const course = await courseService.updateCourse(courseId, updateData);

    logger.info('Course updated by admin', { courseId, title: course.title });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  }),

  deleteCourse: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.id);

    await courseService.deleteCourse(courseId);

    logger.info('Course deleted by admin', { courseId });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  }),

  // Webinar management
  createWebinar: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const webinarData = {
      title: req.body.title,
      image: req.body.image,
      description: req.body.description,
      teacher: req.body.teacher,
      date: req.body.date,
      time: req.body.time,
    };

    const webinar = await webinarService.createWebinar(webinarData);

    logger.info('Webinar created by admin', { webinarId: webinar.id, title: webinar.title });

    res.status(201).json({
      success: true,
      message: 'Webinar created successfully',
      data: webinar,
    });
  }),

  updateWebinar: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const webinarId = parseInt(req.params.id);
    const updateData = {
      title: req.body.title,
      image: req.body.image,
      description: req.body.description,
      teacher: req.body.teacher,
      date: req.body.date,
      time: req.body.time,
      is_active: req.body.isActive,
    };

    const webinar = await webinarService.updateWebinar(webinarId, updateData);

    logger.info('Webinar updated by admin', { webinarId, title: webinar.title });

    res.status(200).json({
      success: true,
      message: 'Webinar updated successfully',
      data: webinar,
    });
  }),

  deleteWebinar: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const webinarId = parseInt(req.params.id);

    await webinarService.deleteWebinar(webinarId);

    logger.info('Webinar deleted by admin', { webinarId });

    res.status(200).json({
      success: true,
      message: 'Webinar deleted successfully',
    });
  }),

  // Get all courses for admin
  getAllCourses: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const courses = await courseService.getAllCourses();

    res.status(200).json({
      success: true,
      data: courses,
    });
  }),

  // Get all webinars for admin
  getAllWebinars: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const webinars = await webinarService.getAllWebinars();
    res.status(200).json({ success: true, data: webinars });
  }),

  // ===================== USER MANAGEMENT =====================
  getAllUsers: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, search } = req.query;
    const result = await profileService.getAllUsers({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      search: search as string,
    });
    res.status(200).json({ success: true, ...result });
  }),

  // ===================== PROGRAM MANAGEMENT =====================
  getAllPrograms: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const programs = await programService.getAllProgramsForAdmin();
    res.status(200).json({ success: true, data: programs });
  }),

  createProgram: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const data = {
      title: req.body.title,
      description: req.body.description,
      domain: req.body.domain,
      level: req.body.level,
      duration: req.body.duration,
      thumbnail: req.body.thumbnail,
      instructor: req.body.instructor,
      price: req.body.price ? parseInt(req.body.price) : 0,
    };
    const program = await programService.createProgram(data);
    logger.info('Program created by admin', { programId: program.id });
    res.status(201).json({ success: true, message: 'Program created successfully', data: program });
  }),

  updateProgram: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const program = await programService.updateProgram(id, req.body);
    logger.info('Program updated by admin', { programId: id });
    res.status(200).json({ success: true, message: 'Program updated successfully', data: program });
  }),

  deleteProgram: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    await programService.deleteProgram(id);
    logger.info('Program deleted by admin', { programId: id });
    res.status(200).json({ success: true, message: 'Program deleted successfully' });
  }),

  // ===================== MODULE MANAGEMENT =====================
  getModules: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const programId = parseInt(req.params.programId);
    const modules = await programService.getModules(programId);
    res.status(200).json({ success: true, data: modules });
  }),

  createModule: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const programId = parseInt(req.params.programId);
    const { title, description, order, isLocked } = req.body;
    const module = await programService.createModule({ programId, title, description, order, isLocked });
    logger.info('Module created by admin', { moduleId: module.id, programId });
    res.status(201).json({ success: true, message: 'Module created successfully', data: module });
  }),

  updateModule: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const module = await programService.updateModule(id, req.body);
    res.status(200).json({ success: true, message: 'Module updated successfully', data: module });
  }),

  deleteModule: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    await programService.deleteModule(id);
    res.status(200).json({ success: true, message: 'Module deleted successfully' });
  }),

  // ===================== LESSON MANAGEMENT =====================
  createLesson: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const moduleId = parseInt(req.params.moduleId);
    const { title, description, duration, videoUrl, videoUrl360p, videoUrl480p, videoUrl720p, order, resources, keyTakeaway } = req.body;
    const lesson = await programService.createLesson({ moduleId, title, description, duration, videoUrl, videoUrl360p, videoUrl480p, videoUrl720p, order, resources, keyTakeaway });
    logger.info('Lesson created by admin', { lessonId: lesson.id, moduleId });
    res.status(201).json({ success: true, message: 'Lesson created successfully', data: lesson });
  }),

  updateLesson: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const lesson = await programService.updateLesson(id, req.body);
    res.status(200).json({ success: true, message: 'Lesson updated successfully', data: lesson });
  }),

  deleteLesson: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    await programService.deleteLesson(id);
    res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
  }),

  // ===================== INTERVIEW MANAGEMENT =====================
  getAllInterviewSessions: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, userId } = req.query;
    const result = await interviewService.getAllSessions({
      userId: userId ? parseInt(userId as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.status(200).json({ success: true, ...result });
  }),

  createInterviewSession: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, topic, interviewer, sessionDate, type } = req.body;
    const parsedSessionDate = new Date(sessionDate);
    if (!userId || Number.isNaN(parseInt(userId))) {
      throw new AppError('Valid User ID is required', 400);
    }
    if (Number.isNaN(parsedSessionDate.getTime())) {
      throw new AppError('Valid session date and time is required', 400);
    }
    if (parsedSessionDate <= new Date()) {
      throw new AppError('Session date and time must be in the future to appear on the dashboard', 400);
    }
    const session = await interviewService.createSession({
      userId: parseInt(userId),
      topic,
      interviewer,
      sessionDate: parsedSessionDate,
      type,
    });
    logger.info('Interview session created by admin', { sessionId: session.id });
    res.status(201).json({ success: true, message: 'Session created successfully', data: session });
  }),

  recordInterviewResult: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const { score, rating, feedback, strengths, improvements } = req.body;
    const session = await interviewService.recordResult(id, { score, rating, feedback, strengths, improvements });
    res.status(200).json({ success: true, message: 'Result recorded successfully', data: session });
  }),

  getAllInterviewBookings: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status, page, limit } = req.query;
    const result = await interviewService.getAllBookings({
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.status(200).json({ success: true, ...result });
  }),

  confirmInterviewBooking: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const { sessionLink } = req.body;
    const booking = await interviewService.confirmBooking(id, sessionLink);
    res.status(200).json({ success: true, message: 'Booking confirmed', data: booking });
  }),

  // ===================== CERTIFICATION MANAGEMENT =====================
  getAllCertifications: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;
    const result = await profileService.getAllCertifications({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.status(200).json({ success: true, ...result });
  }),

  assignCertification: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, programId, title, issuedBy, issuedAt, certificateUrl } = req.body;
    const cert = await profileService.assignCertification({
      userId: parseInt(userId),
      programId: programId ? parseInt(programId) : undefined,
      title,
      issuedBy,
      issuedAt: new Date(issuedAt),
      certificateUrl,
    });
    logger.info('Certification assigned by admin', { certId: cert.id, userId });
    res.status(201).json({ success: true, message: 'Certification assigned successfully', data: cert });
  }),

  // ===================== ELIGIBILITY MANAGEMENT =====================
  setEligibility: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, status, technicalScore, softSkillScore, overallScore, eligibleTiers } = req.body;
    const eligibility = await profileService.setEligibility(parseInt(userId), {
      status,
      technicalScore: parseFloat(technicalScore),
      softSkillScore: parseFloat(softSkillScore),
      overallScore: parseFloat(overallScore),
      eligibleTiers: eligibleTiers || [],
    });
    logger.info('Eligibility updated by admin', { userId });
    res.status(200).json({ success: true, message: 'Eligibility updated successfully', data: eligibility });
  }),

  // ===================== SKILL BADGE MANAGEMENT =====================
  awardSkillBadge: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, name, category } = req.body;
    const badge = await profileService.awardSkillBadge(parseInt(userId), name, category);
    logger.info('Skill badge awarded by admin', { userId, name });
    res.status(201).json({ success: true, message: 'Skill badge awarded successfully', data: badge });
  }),

  // Extended dashboard stats
  getExtendedStats: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const [courses, webinars, programStats, users, certifications, interviews] = await Promise.all([
      courseService.getAllCourses(),
      webinarService.getAllWebinars(),
      programService.getAdminProgramStats(),
      profileService.getAllUsers({ page: 1, limit: 1 }),
      profileService.getAllCertifications({ page: 1, limit: 1 }),
      interviewService.getAllSessions({ page: 1, limit: 1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.length,
        activeCourses: courses.filter((c: any) => c.isActive).length,
        totalWebinars: webinars.length,
        activeWebinars: webinars.filter((w: any) => w.isActive).length,
        totalPrograms: programStats.totalPrograms,
        activePrograms: programStats.activePrograms,
        totalUsers: users.total,
        totalCertifications: certifications.total,
        totalInterviews: interviews.total,
      },
    });
  }),
};

// Validation middleware
export const validateAdminLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validateCourse = [
  body('title').notEmpty().withMessage('Title is required'),
  body('image').isURL().withMessage('Valid image URL is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('syllabus').notEmpty().withMessage('Syllabus is required'),
  body('teacher').notEmpty().withMessage('Teacher is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Valid start date is required (YYYY-MM-DD)'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Valid end date is required (YYYY-MM-DD)'),
  body('telegramLink')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Valid Telegram link is required'),
  handleValidationErrors,
];

export const validateWebinar = [
  body('title').notEmpty().withMessage('Title is required'),
  body('image').isURL().withMessage('Valid image URL is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('teacher').notEmpty().withMessage('Teacher is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  handleValidationErrors,
];
