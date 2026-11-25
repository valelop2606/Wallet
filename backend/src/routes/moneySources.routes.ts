import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/moneySources.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateBody } from '../middleware/validate';
import { createSourceSchema } from '../validation/schemas';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', validateBody(createSourceSchema), asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
