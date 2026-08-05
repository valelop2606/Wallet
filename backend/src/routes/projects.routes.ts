import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/projects.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.list));
router.get('/available-objectives', asyncHandler(controller.getAvailableObjectives));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));
router.post('/:id/assign', asyncHandler(controller.assignMoney));
router.post('/:id/complete', asyncHandler(controller.markCompleted));
router.post('/:id/purchase', asyncHandler(controller.markPurchased));
router.post('/:id/link-objective', asyncHandler(controller.linkObjective));
router.post('/:id/unlink-objective/:objectiveId', asyncHandler(controller.unlinkObjective));

export default router;
