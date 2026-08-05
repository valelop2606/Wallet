import { pool } from '../database/connection';

export interface Transaction {
  id: number;
  user_id: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string | null;
  category: string | null;
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
  category?: string;
  source_id?: number;
  destination_id?: number;
  date?: string;
}

export async function createTransaction(userId: number, input: CreateTransactionInput): Promise<Transaction> {
  const result = await pool.query(
    `INSERT INTO transactions (user_id, type, amount, description, category, source_id, destination_id, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      userId,
      input.type,
      input.amount,
      input.description || null,
      input.category || null,
      input.source_id || null,
      input.destination_id || null,
      input.date || new Date().toISOString(),
    ]
  );
  return result.rows[0];
}

export async function getTransactionsByUser(
  userId: number,
  limit = 50,
  offset = 0
): Promise<Transaction[]> {
  const result = await pool.query(
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

export async function getTransactionById(id: number, userId: number): Promise<Transaction | null> {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateTransaction(
  id: number,
  userId: number,
  input: Partial<CreateTransactionInput>
): Promise<Transaction | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }
  if (input.category !== undefined) {
    fields.push(`category = $${paramIndex++}`);
    values.push(input.category);
  }
  if (input.date !== undefined) {
    fields.push(`date = $${paramIndex++}`);
    values.push(input.date);
  }

  if (fields.length === 0) return getTransactionById(id, userId);

  fields.push(`updated_at = NOW()`);
  values.push(id, userId);

  const result = await pool.query(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} AND status = 'active' RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function voidTransaction(id: number, userId: number): Promise<Transaction | null> {
  const result = await pool.query(
    `UPDATE transactions SET status = 'voided', updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'active'
     RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function getRecentTransactions(userId: number, limit = 5): Promise<Transaction[]> {
  const result = await pool.query(
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
