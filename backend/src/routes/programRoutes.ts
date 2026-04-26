import express from 'express';
import { programController } from '../controllers/programController';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';

const router = express.Router();

// Payment routes (must come before /:id to avoid conflicts)
router.post('/payment/create-order', optionalAuthenticate, programController.createPaymentOrder);
router.post('/payment/verify', programController.verifyPayment);
router.post('/payment/claim', authenticate, programController.claimPayment);

// Lesson routes
router.get('/lessons/:lessonId', authenticate, programController.getLesson);
router.post('/lessons/:lessonId/complete', authenticate, programController.markLessonComplete);

// Public routes (with optional auth for enrollment status)
router.get('/', optionalAuthenticate, programController.getPrograms);
router.get('/filters', programController.getFilterOptions);

// Authenticated routes
router.post('/enroll', authenticate, programController.enroll);
router.patch('/:id/progress', authenticate, programController.updateProgress);
router.get('/user/my-enrollments', authenticate, programController.getMyEnrollments);

// Program content (authenticated)
router.get('/:id/content', authenticate, programController.getProgramContent);

// Public program detail (must come after other specific routes)
router.get('/:id', programController.getProgramById);

export default router;
