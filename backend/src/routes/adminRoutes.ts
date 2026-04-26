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
import { certificationController } from '../controllers/certificationController';

const router = express.Router();

// Admin authentication routes (no auth required for login)
router.post('/login', validateAdminLogin, adminController.login);

// Image upload route (protected with admin auth)
router.post('/upload/image', isAdmin, uploadSingle, imageController.uploadImage);

// Video upload route
router.post('/upload/video', isAdmin, ...(imageController.uploadVideo as any[]));

// Protected admin routes (require admin key)
router.get('/dashboard/stats', isAdmin, adminController.getExtendedStats);

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

// User management
router.get('/users', isAdmin, adminController.getAllUsers);

// Program management
router.get('/programs', isAdmin, adminController.getAllPrograms);
router.post('/programs', isAdmin, adminController.createProgram);
router.put('/programs/:id', isAdmin, adminController.updateProgram);
router.delete('/programs/:id', isAdmin, adminController.deleteProgram);

// Module management
router.get('/programs/:programId/modules', isAdmin, adminController.getModules);
router.post('/programs/:programId/modules', isAdmin, adminController.createModule);
router.put('/modules/:id', isAdmin, adminController.updateModule);
router.delete('/modules/:id', isAdmin, adminController.deleteModule);

// Lesson management
router.post('/modules/:moduleId/lessons', isAdmin, adminController.createLesson);
router.put('/lessons/:id', isAdmin, adminController.updateLesson);
router.delete('/lessons/:id', isAdmin, adminController.deleteLesson);

// Interview management
router.get('/interviews/sessions', isAdmin, adminController.getAllInterviewSessions);
router.post('/interviews/sessions', isAdmin, adminController.createInterviewSession);
router.patch('/interviews/sessions/:id/result', isAdmin, adminController.recordInterviewResult);
router.get('/interviews/bookings', isAdmin, adminController.getAllInterviewBookings);
router.patch('/interviews/bookings/:id/confirm', isAdmin, adminController.confirmInterviewBooking);

// Certification management
router.get('/certifications', isAdmin, adminController.getAllCertifications);
router.post('/certifications', isAdmin, adminController.assignCertification);
router.get('/certification-hub/overview', isAdmin, certificationController.getAdminOverview);
router.post('/certification-hub/projects', isAdmin, certificationController.createAdminProject);
router.put('/certification-hub/projects/:projectId', isAdmin, certificationController.updateAdminProject);
router.patch('/certification-hub/submissions/:submissionId/review', isAdmin, certificationController.reviewSubmission);
router.post('/certification-hub/submissions/:submissionId/certificate', isAdmin, certificationController.issueCertificate);

// Eligibility management
router.post('/eligibility', isAdmin, adminController.setEligibility);

// Skill badge management
router.post('/skill-badges', isAdmin, adminController.awardSkillBadge);

export default router;
