import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/objectives.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateBody } from '../middleware/validate';
import { objectiveMoneySchema, objectivePurchaseSchema } from '../validation/schemas';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));
router.post('/:id/assign', validateBody(objectiveMoneySchema), asyncHandler(controller.assignMoney));
router.post('/:id/unassign', validateBody(objectiveMoneySchema), asyncHandler(controller.unassignMoney));
router.post('/:id/purchase', validateBody(objectivePurchaseSchema), asyncHandler(controller.markPurchased));

export default router;
