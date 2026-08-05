import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/savings.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));
router.post('/:id/deposit', asyncHandler(controller.deposit));
router.post('/:id/withdraw', asyncHandler(controller.withdraw));

export default router;
