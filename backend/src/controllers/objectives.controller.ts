import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { withTransaction } from '../database/connection';
import {
  createObjective,
  getObjectivesByUser,
  getObjectiveById,
  updateObjective,
  deleteObjective,
  assignMoneyToObjective,
  unassignMoneyFromObjective,
} from '../models/objective.model';
import { createAchievement } from '../models/achievement.model';
import { createTransaction } from '../models/transaction.model';
import { updateBalance, getMoneySourceById } from '../models/moneySource.model';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const objectives = await getObjectivesByUser(req.userId!);
  res.json({ objectives });
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  const objective = await getObjectiveById(Number(req.params.id), req.userId!);
  if (!objective) throw new AppError('Objective not found', 404);
  res.json(objective);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, target_amount, project_id } = req.body;

  if (!name || !target_amount) {
    throw new AppError('Name and target amount are required', 400);
  }

  if (target_amount <= 0) {
    throw new AppError('Target amount must be positive', 400);
  }

  const objective = await createObjective(req.userId!, { name, description, target_amount, project_id });
  res.status(201).json(objective);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, target_amount, project_id, status } = req.body;
  const objective = await updateObjective(Number(req.params.id), req.userId!, {
    name,
    description,
    target_amount,
    project_id,
    status,
  });
  if (!objective) throw new AppError('Objective not found', 404);
  res.json(objective);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const objective = await getObjectiveById(Number(req.params.id), req.userId!);
  if (!objective) throw new AppError('Objective not found', 404);

  // If objective has money assigned, return it to user's available balance
  // (we just delete it; the money was "virtual" assignment not real balance deduction
  // unless source-based assignment is used — in that case it was already deducted)
  const deleted = await deleteObjective(Number(req.params.id), req.userId!);
  if (!deleted) throw new AppError('Objective not found', 404);

  res.json({
    message: 'Objective deleted',
    deleted_objective: {
      id: objective.id,
      name: objective.name,
      target_amount: objective.target_amount,
      current_amount: objective.current_amount,
      status: objective.status,
    },
  });
}

export async function assignMoney(req: AuthRequest, res: Response): Promise<void> {
  const { amount, source_id } = req.body;
  const userId = req.userId!;

  const objective = await withTransaction(async () => {
    const source = await getMoneySourceById(source_id, userId);
    if (!source) throw new AppError('Money source not found', 404);

    const deducted = await updateBalance(source_id, userId, -amount);
    if (!deducted) throw new AppError('Insufficient balance in selected source', 400);

    // Throwing here rolls back the balance deduction above
    const result = await assignMoneyToObjective(Number(req.params.id), userId, amount);
    if (!result) throw new AppError('Objective not found or invalid amount', 400);

    // If objective was just completed, create achievement
    if (result.status === 'completed' && result.current_amount >= result.target_amount) {
      await createAchievement(
        userId,
        'objective',
        result.id,
        result.name,
        result.description || undefined,
        result.target_amount
      );
    }
    return result;
  });

  res.json(objective);
}

export async function unassignMoney(req: AuthRequest, res: Response): Promise<void> {
  const { amount, source_id } = req.body;
  const userId = req.userId!;

  const result = await withTransaction(async () => {
    const source = await getMoneySourceById(source_id, userId);
    if (!source) throw new AppError('Money source not found', 404);

    const objective = await getObjectiveById(Number(req.params.id), userId);
    if (!objective) throw new AppError('Objective not found', 404);
    if (objective.status === 'purchased') throw new AppError('Cannot unassign from a purchased objective', 400);

    const updated = await unassignMoneyFromObjective(Number(req.params.id), userId, amount);
    if (!updated) throw new AppError('Amount exceeds currently assigned money', 400);

    // Return money to the source
    await updateBalance(source_id, userId, amount);
    return updated;
  });

  res.json(result);
}

export async function markPurchased(req: AuthRequest, res: Response): Promise<void> {
  const { source_id } = req.body;
  const userId = req.userId!;

  const updated = await withTransaction(async () => {
    const objective = await getObjectiveById(Number(req.params.id), userId);
    if (!objective) throw new AppError('Objective not found', 404);
    if (objective.status !== 'completed') throw new AppError('Objective must be completed before marking as purchased', 400);

    const source = await getMoneySourceById(source_id, userId);
    if (!source) throw new AppError('Money source not found', 404);

    const purchaseAmount = Number(objective.current_amount);

    const deducted = await updateBalance(source_id, userId, -purchaseAmount);
    if (!deducted) throw new AppError('Insufficient balance in selected source', 400);

    // Register as expense transaction
    await createTransaction(userId, {
      type: 'expense',
      amount: purchaseAmount,
      description: `Compra: ${objective.name}`,
      source_id,
    });

    // Set objective to purchased and zero out current_amount (money is spent)
    const result = await updateObjective(Number(req.params.id), userId, { status: 'purchased' });
    await unassignMoneyFromObjective(Number(req.params.id), userId, purchaseAmount);
    return result;
  });

  res.json(updated);
}
