import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { userService } from '../services/userService';
import { asyncHandler, AppError, handleValidationErrors } from '../middlewares/errorHandler';

export const userController = {
  // Create or update user
  createUser: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseUid, phone, name, email } = req.body;

    if (!firebaseUid || !name || !email) {
      throw new AppError('Firebase UID, name, and email are required', 400);
    }

    try {
      const user = await userService.createUser(firebaseUid, phone || '', name, email);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (err: any) {
      // Handle Prisma unique constraint violation (e.g. duplicate email)
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        throw new AppError(`An account with this ${field} already exists. Please sign in instead.`, 409);
      }
      throw err;
    }
  }),

  // Check if a phone number is already registered
  checkPhone: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.params;

    const user = await userService.getUserByPhone(phone);

    res.status(200).json({
      success: true,
      exists: !!user,
    });
  }),

  // Get user profile (detailed with enrollments)
  getProfile: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const firebaseUid = req.headers['x-firebase-uid'] as string;

    if (!firebaseUid) {
      throw new AppError('Authentication required', 401);
    }

    const user = await userService.getUserByFirebaseUid(firebaseUid);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }),

  // Get user dashboard data
  getDashboard: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const firebaseUid = req.headers['x-firebase-uid'] as string;

    if (!firebaseUid) {
      throw new AppError('Authentication required', 401);
    }

    const user = await userService.getUserByFirebaseUid(firebaseUid);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const stats = await userService.getUserStats(user.id);
    const courses = await userService.getUserCourses(user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
        },
        stats,
        recentCourses: courses.slice(0, 3), // Last 3 enrolled courses
      },
    });
  }),

  // Get user's enrolled courses
  getMyCourses: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const firebaseUid = req.headers['x-firebase-uid'] as string;

    if (!firebaseUid) {
      throw new AppError('Authentication required', 401);
    }

    const user = await userService.getUserByFirebaseUid(firebaseUid);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const courses = await userService.getUserCourses(user.id);

    res.status(200).json({
      success: true,
      data: courses,
    });
  }),

  // Check if user is enrolled in a specific course
  checkEnrollment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const firebaseUid = req.headers['x-firebase-uid'] as string;
    const { courseId } = req.params;

    if (!firebaseUid) {
      throw new AppError('Authentication required', 401);
    }

    const user = await userService.getUserByFirebaseUid(firebaseUid);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isEnrolled = await userService.isUserEnrolledInCourse(user.id, parseInt(courseId));

    res.status(200).json({
      success: true,
      data: {
        enrolled: isEnrolled,
        userId: user.id,
        courseId: parseInt(courseId),
      },
    });
  }),

  // Get user by Firebase UID (admin use)
  getUserByFirebaseUid: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firebaseUid } = req.params;

    const user = await userService.getUserByFirebaseUid(firebaseUid);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }),
};

// Validation middleware
export const validateCreateUser = [
  body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  handleValidationErrors,
];
