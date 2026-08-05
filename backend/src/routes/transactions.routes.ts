import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/transactions.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.get('/:id/modifications', asyncHandler(controller.getModifications));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.post('/:id/void', asyncHandler(controller.voidOne));

export default router;
