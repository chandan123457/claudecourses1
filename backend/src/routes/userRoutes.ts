import express from 'express';
import { userController, validateCreateUser } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/create', validateCreateUser, userController.createUser);
router.get('/check-phone/:phone', userController.checkPhone);
router.get('/:firebaseUid', userController.getUserByFirebaseUid);

// Protected routes (require authentication via Firebase UID header)
router.get('/profile/me', userController.getProfile);
router.get('/dashboard/data', userController.getDashboard);
router.get('/courses/enrolled', userController.getMyCourses);
router.get('/courses/:courseId/enrollment', userController.checkEnrollment);

// Legacy protected route (with authenticate middleware)
router.get('/profile/legacy', authenticate, userController.getProfile);

export default router;
