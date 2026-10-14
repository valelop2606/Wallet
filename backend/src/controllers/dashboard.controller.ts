import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getMoneySourcesByUser, getTotalBalance } from '../models/moneySource.model';
import { getRecentTransactions } from '../models/transaction.model';
import { getSavingsByUser, getTotalSavings } from '../models/saving.model';
import { getActiveObjectives, getTotalAssignedToObjectives } from '../models/objective.model';
import { getActiveProjects, getTotalAssignedToProjects } from '../models/project.model';
import { getAchievementsByUser } from '../models/achievement.model';
import { calculateDashboardMetrics, getReachableObjectives } from '../utils/dashboard.utils';

export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;

  const [
    sources,
    totalBalance,
    recentTransactions,
    savings,
    totalSavings,
    activeObjectives,
    totalAssignedObjectives,
    activeProjects,
    totalAssignedProjects,
    achievements,
  ] = await Promise.all([
    getMoneySourcesByUser(userId),
    getTotalBalance(userId),
    getRecentTransactions(userId, 5),
    getSavingsByUser(userId),
    getTotalSavings(userId),
    getActiveObjectives(userId),
    getTotalAssignedToObjectives(userId),
    getActiveProjects(userId),
    getTotalAssignedToProjects(userId),
    getAchievementsByUser(userId),
  ]);

  const { availableMoney, totalAssigned, patrimony } = calculateDashboardMetrics(
    totalBalance,
    totalSavings,
    totalAssignedObjectives,
    totalAssignedProjects
  );
  const reachableObjectives = getReachableObjectives(activeObjectives, availableMoney);

  res.json({
    available_money: availableMoney,
    total_balance: totalBalance,
    total_assigned: totalAssigned,
    total_savings: totalSavings,
    patrimony,
    sources,
    savings,
    active_objectives: activeObjectives,
    active_projects: activeProjects,
    reachable_objectives: reachableObjectives,
    recent_transactions: recentTransactions,
    achievements,
  });
}
