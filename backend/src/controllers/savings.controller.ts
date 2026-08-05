import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createSaving,
  getSavingsByUser,
  getSavingById,
  updateSaving,
  deleteSaving,
  depositToSaving,
  withdrawFromSaving,
  getTotalSavings,
} from '../models/saving.model';
import { updateBalance, getMoneySourceById } from '../models/moneySource.model';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const savings = await getSavingsByUser(req.userId!);
  const total = await getTotalSavings(req.userId!);
  res.json({ savings, total });
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  const saving = await getSavingById(Number(req.params.id), req.userId!);
  if (!saving) throw new AppError('Saving not found', 404);
  res.json(saving);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, current_amount, goal_amount, storage_source_id } = req.body;

  if (!name) throw new AppError('Name is required', 400);

  const saving = await createSaving(req.userId!, {
    name,
    description,
    current_amount,
    goal_amount,
    storage_source_id,
  });
  res.status(201).json(saving);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, goal_amount, storage_source_id } = req.body;
  const saving = await updateSaving(Number(req.params.id), req.userId!, {
    name,
    description,
    goal_amount,
    storage_source_id,
  });
  if (!saving) throw new AppError('Saving not found', 404);
  res.json(saving);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const deleted = await deleteSaving(Number(req.params.id), req.userId!);
  if (!deleted) throw new AppError('Saving not found', 404);
  res.json({ message: 'Saving deleted' });
}

export async function deposit(req: AuthRequest, res: Response): Promise<void> {
  const { amount, source_id } = req.body;

  if (!amount || amount <= 0) throw new AppError('Amount must be positive', 400);

  // If source_id provided, deduct from that money source
  if (source_id) {
    const source = await getMoneySourceById(source_id, req.userId!);
    if (!source) throw new AppError('Source not found', 404);
    const updated = await updateBalance(source_id, req.userId!, -amount);
    if (!updated) throw new AppError('Insufficient balance in source', 400);
  }

  const saving = await depositToSaving(Number(req.params.id), req.userId!, amount);
  if (!saving) throw new AppError('Saving not found', 404);
  res.json(saving);
}

export async function withdraw(req: AuthRequest, res: Response): Promise<void> {
  const { amount, destination_id } = req.body;

  if (!amount || amount <= 0) throw new AppError('Amount must be positive', 400);

  const saving = await withdrawFromSaving(Number(req.params.id), req.userId!, amount);
  if (!saving) throw new AppError('Insufficient saving balance or saving not found', 400);

  // If destination_id provided, add to that money source
  if (destination_id) {
    await updateBalance(destination_id, req.userId!, amount);
  }

  res.json(saving);
}
