import express from 'express';
import userRoutes from './userRoutes';
import webinarRoutes from './webinarRoutes';
import courseRoutes from './courseRoutes';
import paymentRoutes from './paymentRoutes';
import adminRoutes from './adminRoutes';
import dashboardRoutes from './dashboardRoutes';
import programRoutes from './programRoutes';
import interviewRoutes from './interviewRoutes';
import profileRoutes from './profileRoutes';
import certificationRoutes from './certificationRoutes';

const router = express.Router();

// API routes
router.use('/users', userRoutes);
router.use('/webinars', webinarRoutes);
router.use('/courses', courseRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

// Dashboard platform routes
router.use('/dashboard', dashboardRoutes);
router.use('/programs', programRoutes);
router.use('/interviews', interviewRoutes);
router.use('/profile', profileRoutes);
router.use('/certification', certificationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
