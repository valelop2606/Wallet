import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/savings.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateBody } from '../middleware/validate';
import { savingDepositSchema, savingWithdrawSchema } from '../validation/schemas';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));
router.post('/:id/deposit', validateBody(savingDepositSchema), asyncHandler(controller.deposit));
router.post('/:id/withdraw', validateBody(savingWithdrawSchema), asyncHandler(controller.withdraw));

export default router;
