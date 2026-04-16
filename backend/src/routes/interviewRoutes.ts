import express from 'express';
import { interviewController, validateBooking } from '../controllers/interviewController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticate, interviewController.getInterviewData);
router.post('/book', authenticate, validateBooking, interviewController.bookInterview);
router.delete('/bookings/:id', authenticate, interviewController.cancelBooking);

export default router;
