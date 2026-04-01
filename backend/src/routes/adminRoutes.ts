import express from 'express';
import {
  adminController,
  validateAdminLogin,
  validateCourse,
  validateWebinar,
} from '../controllers/adminController';
import { isAdmin } from '../middlewares/auth';
import { uploadSingle } from '../middlewares/upload';
import imageController from '../controllers/imageController';

const router = express.Router();

// Admin authentication routes (no auth required for login)
router.post('/login', validateAdminLogin, adminController.login);

// Image upload route (protected with admin auth)
router.post('/upload/image', isAdmin, uploadSingle, imageController.uploadImage);

// Protected admin routes (require admin key)
router.get('/dashboard/stats', isAdmin, adminController.getDashboardStats);

// Course management routes
router.get('/courses', isAdmin, adminController.getAllCourses);
router.post('/courses', isAdmin, validateCourse, adminController.createCourse);
router.put('/courses/:id', isAdmin, validateCourse, adminController.updateCourse);
router.delete('/courses/:id', isAdmin, adminController.deleteCourse);

// Webinar management routes
router.get('/webinars', isAdmin, adminController.getAllWebinars);
router.post('/webinars', isAdmin, validateWebinar, adminController.createWebinar);
router.put('/webinars/:id', isAdmin, validateWebinar, adminController.updateWebinar);
router.delete('/webinars/:id', isAdmin, adminController.deleteWebinar);

export default router;