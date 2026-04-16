import express from 'express';
import { profileController } from '../controllers/profileController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticate, profileController.getProfile);
router.patch('/', authenticate, profileController.updateProfile);

export default router;
