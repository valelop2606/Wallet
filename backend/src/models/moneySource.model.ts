import { db } from '../database/connection';

export interface MoneySource {
  id: number;
  user_id: number;
  name: string;
  type: string;
  balance: number;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMoneySourceInput {
  name: string;
  type: string;
  balance?: number;
  description?: string;
}

export async function createMoneySource(userId: number, input: CreateMoneySourceInput): Promise<MoneySource> {
  const result = await db().query(
    `INSERT INTO money_sources (user_id, name, type, balance, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, input.name, input.type, input.balance || 0, input.description || null]
  );
  return result.rows[0];
}

export async function getMoneySourcesByUser(userId: number): Promise<MoneySource[]> {
  const result = await db().query(
    'SELECT * FROM money_sources WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows;
}

export async function getMoneySourceById(id: number, userId: number): Promise<MoneySource | null> {
  const result = await db().query(
    'SELECT * FROM money_sources WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateMoneySource(
  id: number,
  userId: number,
  input: Partial<CreateMoneySourceInput>
): Promise<MoneySource | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.type !== undefined) {
    fields.push(`type = $${paramIndex++}`);
    values.push(input.type);
  }
  if (input.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }

  if (fields.length === 0) return getMoneySourceById(id, userId);

  fields.push(`updated_at = NOW()`);
  values.push(id, userId);

  const result = await db().query(
    `UPDATE money_sources SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteMoneySource(id: number, userId: number): Promise<boolean> {
  const result = await db().query(
    'DELETE FROM money_sources WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateBalance(id: number, userId: number, amount: number): Promise<MoneySource | null> {
  const result = await db().query(
    `UPDATE money_sources SET balance = balance + $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND balance + $1 >= 0
     RETURNING *`,
    [amount, id, userId]
  );
  return result.rows[0] || null;
}

export async function getTotalBalance(userId: number): Promise<number> {
  const result = await db().query(
    'SELECT COALESCE(SUM(balance), 0) as total FROM money_sources WHERE user_id = $1',
    [userId]
  );
  return parseFloat(result.rows[0].total);
}
