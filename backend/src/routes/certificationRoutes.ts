import express from 'express';
import { certificationController } from '../controllers/certificationController';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';
import { uploadDocument } from '../middlewares/upload';

const router = express.Router();

router.get('/projects', optionalAuthenticate, certificationController.getProjects);
router.get('/projects/:identifier', optionalAuthenticate, certificationController.getProject);
router.post('/apply-coupon', certificationController.applyCoupon);
router.post('/create-order', authenticate, certificationController.createOrder);
router.post('/verify-payment', certificationController.verifyPayment);
router.post('/upload', authenticate, uploadDocument, certificationController.uploadFile);
router.get('/workspace/:enrollmentId', authenticate, certificationController.getWorkspace);
router.post('/workspace/:enrollmentId/submissions', authenticate, certificationController.submitProject);
router.post('/workspace/:enrollmentId/book-session', authenticate, certificationController.bookSession);

export default router;

