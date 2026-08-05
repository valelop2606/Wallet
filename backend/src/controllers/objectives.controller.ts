import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
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
  const deleted = await deleteObjective(Number(req.params.id), req.userId!);
  if (!deleted) throw new AppError('Objective not found', 404);
  res.json({ message: 'Objective deleted' });
}

export async function assignMoney(req: AuthRequest, res: Response): Promise<void> {
  const { amount } = req.body;

  if (!amount || amount <= 0) throw new AppError('Amount must be positive', 400);

  const objective = await assignMoneyToObjective(Number(req.params.id), req.userId!, amount);
  if (!objective) throw new AppError('Objective not found or invalid amount', 400);

  // If objective was just completed, create achievement
  if (objective.status === 'completed' && objective.current_amount >= objective.target_amount) {
    await createAchievement(
      req.userId!,
      'objective',
      objective.id,
      objective.name,
      objective.description || undefined,
      objective.target_amount
    );
  }

  res.json(objective);
}

export async function markPurchased(req: AuthRequest, res: Response): Promise<void> {
  const { source_id } = req.body;
  if (!source_id) throw new AppError('Source money source is required', 400);

  const objective = await getObjectiveById(Number(req.params.id), req.userId!);
  if (!objective) throw new AppError('Objective not found', 404);
  if (objective.status !== 'completed') throw new AppError('Objective must be completed before marking as purchased', 400);

  // Verify ownership of source
  const source = await getMoneySourceById(source_id, req.userId!);
  if (!source) throw new AppError('Money source not found', 404);

  const purchaseAmount = Number(objective.current_amount);

  // Deduct from money source
  const deducted = await updateBalance(source_id, req.userId!, -purchaseAmount);
  if (!deducted) throw new AppError('Insufficient balance in selected source', 400);

  // Register as expense transaction
  await createTransaction(req.userId!, {
    type: 'expense',
    amount: purchaseAmount,
    description: `Compra: ${objective.name}`,
    source_id,
  });

  // Set objective to purchased and reset current_amount to 0 (money is spent)
  const updated = await updateObjective(Number(req.params.id), req.userId!, {
    status: 'purchased',
  });

  // Zero out current_amount since money was spent
  await unassignMoneyFromObjective(Number(req.params.id), req.userId!, purchaseAmount);

  res.json(updated);
}

export async function unassignMoney(req: AuthRequest, res: Response): Promise<void> {
  const { amount } = req.body;

  if (!amount || amount <= 0) throw new AppError('Amount must be positive', 400);

  const objective = await getObjectiveById(Number(req.params.id), req.userId!);
  if (!objective) throw new AppError('Objective not found', 404);
  if (objective.status === 'purchased') throw new AppError('Cannot unassign from a purchased objective', 400);

  const result = await unassignMoneyFromObjective(Number(req.params.id), req.userId!, amount);
  if (!result) throw new AppError('Amount exceeds currently assigned money', 400);

  res.json(result);
}
