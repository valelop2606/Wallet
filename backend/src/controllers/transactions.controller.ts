import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createTransaction,
  getTransactionsByUser,
  getTransactionById,
  updateTransaction,
  voidTransaction,
} from '../models/transaction.model';
import { updateBalance, getMoneySourceById } from '../models/moneySource.model';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;
  const transactions = await getTransactionsByUser(req.userId!, limit, offset);
  res.json({ transactions });
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  const transaction = await getTransactionById(Number(req.params.id), req.userId!);
  if (!transaction) throw new AppError('Transaction not found', 404);
  res.json(transaction);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { type, amount, description, category, source_id, destination_id, date } = req.body;

  if (!type || !amount) {
    throw new AppError('Type and amount are required', 400);
  }

  if (!['income', 'expense', 'transfer'].includes(type)) {
    throw new AppError('Type must be income, expense, or transfer', 400);
  }

  if (amount <= 0) {
    throw new AppError('Amount must be positive', 400);
  }

  // Validate source/destination based on type
  if (type === 'expense' && !source_id) {
    throw new AppError('Source is required for expenses', 400);
  }
  if (type === 'income' && !destination_id) {
    throw new AppError('Destination is required for income', 400);
  }
  if (type === 'transfer' && (!source_id || !destination_id)) {
    throw new AppError('Source and destination are required for transfers', 400);
  }

  // Verify ownership of sources
  if (source_id) {
    const source = await getMoneySourceById(source_id, req.userId!);
    if (!source) throw new AppError('Source not found', 404);
  }
  if (destination_id) {
    const dest = await getMoneySourceById(destination_id, req.userId!);
    if (!dest) throw new AppError('Destination not found', 404);
  }

  // Update balances
  if (type === 'expense') {
    const updated = await updateBalance(source_id, req.userId!, -amount);
    if (!updated) throw new AppError('Insufficient balance in source', 400);
  } else if (type === 'income') {
    await updateBalance(destination_id, req.userId!, amount);
  } else if (type === 'transfer') {
    const updated = await updateBalance(source_id, req.userId!, -amount);
    if (!updated) throw new AppError('Insufficient balance in source', 400);
    await updateBalance(destination_id, req.userId!, amount);
  }

  const transaction = await createTransaction(req.userId!, {
    type,
    amount,
    description,
    category,
    source_id,
    destination_id,
    date,
  });

  res.status(201).json(transaction);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { description, category, date } = req.body;
  const transaction = await updateTransaction(Number(req.params.id), req.userId!, {
    description,
    category,
    date,
  });
  if (!transaction) throw new AppError('Transaction not found', 404);
  res.json(transaction);
}

export async function voidOne(req: AuthRequest, res: Response): Promise<void> {
  const transaction = await getTransactionById(Number(req.params.id), req.userId!);
  if (!transaction) throw new AppError('Transaction not found', 404);
  if (transaction.status === 'voided') throw new AppError('Transaction already voided', 400);

  // Reverse the balance changes
  if (transaction.type === 'expense' && transaction.source_id) {
    await updateBalance(transaction.source_id, req.userId!, transaction.amount);
  } else if (transaction.type === 'income' && transaction.destination_id) {
    const updated = await updateBalance(transaction.destination_id, req.userId!, -transaction.amount);
    if (!updated) throw new AppError('Cannot void: insufficient balance in destination', 400);
  } else if (transaction.type === 'transfer') {
    if (transaction.destination_id) {
      const updated = await updateBalance(transaction.destination_id, req.userId!, -transaction.amount);
      if (!updated) throw new AppError('Cannot void: insufficient balance in destination', 400);
    }
    if (transaction.source_id) {
      await updateBalance(transaction.source_id, req.userId!, transaction.amount);
    }
  }

  const voided = await voidTransaction(Number(req.params.id), req.userId!);
  res.json(voided);
}
