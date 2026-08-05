import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getMoneySourcesByUser, getTotalBalance } from '../models/moneySource.model';
import { getRecentTransactions } from '../models/transaction.model';
import { getSavingsByUser, getTotalSavings } from '../models/saving.model';
import { getActiveObjectives, getTotalAssignedToObjectives } from '../models/objective.model';
import { getActiveProjects, getTotalAssignedToProjects } from '../models/project.model';
import { getAchievementsByUser } from '../models/achievement.model';

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

  const totalAssigned = totalAssignedObjectives + totalAssignedProjects;
  const availableMoney = totalBalance - totalAssigned;
  const patrimony = totalBalance + totalSavings;

  // Find reachable objectives (ones that can be completed with available money)
  const reachableObjectives = activeObjectives.filter(
    (obj) => Number(obj.target_amount) - Number(obj.current_amount) <= availableMoney
  );

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
