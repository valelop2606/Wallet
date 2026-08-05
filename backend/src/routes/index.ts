import { Router } from 'express';
import authRoutes from './auth.routes';
import moneySourcesRoutes from './moneySources.routes';
import transactionsRoutes from './transactions.routes';
import savingsRoutes from './savings.routes';
import objectivesRoutes from './objectives.routes';
import projectsRoutes from './projects.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sources', moneySourcesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/savings', savingsRoutes);
router.use('/objectives', objectivesRoutes);
router.use('/projects', projectsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
