import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboard.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getDashboard));

export default router;
