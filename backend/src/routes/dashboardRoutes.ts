import express from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticate, dashboardController.getDashboard);

export default router;
