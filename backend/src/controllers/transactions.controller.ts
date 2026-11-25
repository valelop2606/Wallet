import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { withTransaction } from '../database/connection';
import {
  createTransaction,
  getTransactionsByUser,
  getTransactionById,
  updateTransactionDescription,
  updateTransactionAmount,
  voidTransaction,
} from '../models/transaction.model';
import { updateBalance, getMoneySourceById } from '../models/moneySource.model';
import { createModification, getModificationsByTransaction } from '../models/transactionModification.model';

// Request bodies are validated and normalized by zod (see validation/schemas.ts).
// Every handler that moves money runs inside `withTransaction`: if any step
// fails (insufficient balance, missing row, DB error) all balance changes roll back.

async function debit(sourceId: number, userId: number, amount: number, message: string): Promise<void> {
  const updated = await updateBalance(sourceId, userId, -amount);
  if (!updated) throw new AppError(message, 400);
}

async function credit(destinationId: number, userId: number, amount: number): Promise<void> {
  const updated = await updateBalance(destinationId, userId, amount);
  if (!updated) throw new AppError('Destination not found', 404);
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const transactions = await getTransactionsByUser(req.userId!, limit, offset);
  res.json({ transactions });
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  const transaction = await getTransactionById(Number(req.params.id), req.userId!);
  if (!transaction) throw new AppError('Transaction not found', 404);
  const modifications = await getModificationsByTransaction(transaction.id);
  res.json({ ...transaction, modifications });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { type, amount, description, source_id, destination_id } = req.body;
  const userId = req.userId!;

  const transaction = await withTransaction(async () => {
    if (source_id && !(await getMoneySourceById(source_id, userId))) {
      throw new AppError('Source not found', 404);
    }
    if (destination_id && !(await getMoneySourceById(destination_id, userId))) {
      throw new AppError('Destination not found', 404);
    }

    if (type === 'expense' || type === 'transfer') {
      await debit(source_id, userId, amount, 'Insufficient balance in source');
    }
    if (type === 'income' || type === 'transfer') {
      await credit(destination_id, userId, amount);
    }

    return createTransaction(userId, { type, amount, description, source_id, destination_id });
  });

  res.status(201).json(transaction);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { description, amount } = req.body;
  const txId = Number(req.params.id);
  const userId = req.userId!;

  await withTransaction(async () => {
    const transaction = await getTransactionById(txId, userId, { forUpdate: true });
    if (!transaction) throw new AppError('Transaction not found', 404);
    if (transaction.status !== 'active') throw new AppError('Cannot edit a voided transaction', 400);

    if (amount !== undefined) {
      const oldAmount = Number(transaction.amount);
      const diff = Math.round((amount - oldAmount) * 100) / 100;

      if (diff !== 0) {
        const msg = 'Insufficient balance for this amount change';
        if (transaction.source_id && (transaction.type === 'expense' || transaction.type === 'transfer')) {
          await debit(transaction.source_id, userId, diff, msg); // negative diff = refund
        }
        if (transaction.destination_id && (transaction.type === 'income' || transaction.type === 'transfer')) {
          await debit(transaction.destination_id, userId, -diff, msg);
        }
        await updateTransactionAmount(txId, userId, amount);
        await createModification(txId, userId, 'amount', oldAmount.toFixed(2), amount.toFixed(2));
      }
    }

    if (description !== undefined) {
      const oldDesc = transaction.description || '';
      const newDesc = description || '';
      if (oldDesc !== newDesc) {
        await updateTransactionDescription(txId, userId, newDesc || null);
        await createModification(txId, userId, 'description', oldDesc || null, newDesc || null);
      }
    }
  });

  const updated = await getTransactionById(txId, userId);
  const modifications = await getModificationsByTransaction(txId);
  res.json({ ...updated, modifications });
}

export async function getModifications(req: AuthRequest, res: Response): Promise<void> {
  const txId = Number(req.params.id);
  const transaction = await getTransactionById(txId, req.userId!);
  if (!transaction) throw new AppError('Transaction not found', 404);
  const modifications = await getModificationsByTransaction(txId);
  res.json({ modifications });
}

export async function voidOne(req: AuthRequest, res: Response): Promise<void> {
  const txId = Number(req.params.id);
  const userId = req.userId!;

  const voided = await withTransaction(async () => {
    // Flip status first: the conditional UPDATE locks the row, so two
    // concurrent void requests can never both reverse the balances.
    const transaction = await voidTransaction(txId, userId);
    if (!transaction) {
      const existing = await getTransactionById(txId, userId);
      if (!existing) throw new AppError('Transaction not found', 404);
      throw new AppError('Transaction already voided', 400);
    }

    const amount = Number(transaction.amount);
    const msg = 'Cannot void: insufficient balance in destination';
    if (transaction.destination_id && (transaction.type === 'income' || transaction.type === 'transfer')) {
      await debit(transaction.destination_id, userId, amount, msg);
    }
    if (transaction.source_id && (transaction.type === 'expense' || transaction.type === 'transfer')) {
      await credit(transaction.source_id, userId, amount);
    }
    return transaction;
  });

  res.json(voided);
}
