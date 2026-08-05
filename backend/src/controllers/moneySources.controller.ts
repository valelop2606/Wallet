import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createMoneySource,
  getMoneySourcesByUser,
  getMoneySourceById,
  updateMoneySource,
  deleteMoneySource,
  getTotalBalance,
} from '../models/moneySource.model';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const sources = await getMoneySourcesByUser(req.userId!);
  const total = await getTotalBalance(req.userId!);
  res.json({ sources, total });
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  const source = await getMoneySourceById(Number(req.params.id), req.userId!);
  if (!source) throw new AppError('Money source not found', 404);
  res.json(source);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { name, type, balance, description } = req.body;

  if (!name || !type) {
    throw new AppError('Name and type are required', 400);
  }

  if (balance !== undefined && balance < 0) {
    throw new AppError('Balance cannot be negative', 400);
  }

  const source = await createMoneySource(req.userId!, { name, type, balance, description });
  res.status(201).json(source);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { name, type, description } = req.body;
  const source = await updateMoneySource(Number(req.params.id), req.userId!, { name, type, description });
  if (!source) throw new AppError('Money source not found', 404);
  res.json(source);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const deleted = await deleteMoneySource(Number(req.params.id), req.userId!);
  if (!deleted) throw new AppError('Money source not found or has associated transactions', 404);
  res.json({ message: 'Money source deleted' });
}
