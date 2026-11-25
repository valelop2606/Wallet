import { db } from '../database/connection';

export interface Transaction {
  id: number;
  user_id: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string | null;
  source_id: number | null;
  destination_id: number | null;
  date: Date;
  status: 'active' | 'voided';
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionInput {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  source_id?: number;
  destination_id?: number;
}

export async function createTransaction(userId: number, input: CreateTransactionInput): Promise<Transaction> {
  const result = await db().query(
    `INSERT INTO transactions (user_id, type, amount, description, source_id, destination_id, date)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [
      userId,
      input.type,
      input.amount,
      input.description || null,
      input.source_id || null,
      input.destination_id || null,
    ]
  );
  return result.rows[0];
}

export async function getTransactionsByUser(
  userId: number,
  limit = 50,
  offset = 0
): Promise<Transaction[]> {
  const result = await db().query(
    `SELECT t.*, 
       s.name as source_name, 
       d.name as destination_name
     FROM transactions t
     LEFT JOIN money_sources s ON t.source_id = s.id
     LEFT JOIN money_sources d ON t.destination_id = d.id
     WHERE t.user_id = $1 AND t.status = 'active'
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
}

export async function getTransactionById(
  id: number,
  userId: number,
  opts: { forUpdate?: boolean } = {}
): Promise<Transaction | null> {
  const result = await db().query(
    `SELECT * FROM transactions WHERE id = $1 AND user_id = $2${opts.forUpdate ? ' FOR UPDATE' : ''}`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateTransactionDescription(
  id: number,
  userId: number,
  description: string | null
): Promise<Transaction | null> {
  const result = await db().query(
    `UPDATE transactions SET description = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND status = 'active'
     RETURNING *`,
    [description, id, userId]
  );
  return result.rows[0] || null;
}

export async function updateTransactionAmount(
  id: number,
  userId: number,
  newAmount: number
): Promise<Transaction | null> {
  const result = await db().query(
    `UPDATE transactions SET amount = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND status = 'active'
     RETURNING *`,
    [newAmount, id, userId]
  );
  return result.rows[0] || null;
}

export async function voidTransaction(id: number, userId: number): Promise<Transaction | null> {
  const result = await db().query(
    `UPDATE transactions SET status = 'voided', updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'active'
     RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function getRecentTransactions(userId: number, limit = 5): Promise<Transaction[]> {
  const result = await db().query(
    `SELECT t.*, 
       s.name as source_name, 
       d.name as destination_name
     FROM transactions t
     LEFT JOIN money_sources s ON t.source_id = s.id
     LEFT JOIN money_sources d ON t.destination_id = d.id
     WHERE t.user_id = $1 AND t.status = 'active'
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}
