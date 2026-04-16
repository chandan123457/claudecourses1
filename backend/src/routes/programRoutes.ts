import express from 'express';
import { programController, validateProgram } from '../controllers/programController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', programController.getPrograms);
router.get('/filters', programController.getFilterOptions);
router.get('/:id', programController.getProgramById);

// Authenticated routes
router.post('/enroll', authenticate, programController.enroll);
router.patch('/:id/progress', authenticate, programController.updateProgress);
router.get('/user/my-enrollments', authenticate, programController.getMyEnrollments);

export default router;
