import { db } from '../database/connection';

export interface Saving {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  current_amount: number;
  goal_amount: number | null;
  storage_source_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSavingInput {
  name: string;
  description?: string;
  current_amount?: number;
  goal_amount?: number;
  storage_source_id?: number;
}

export async function createSaving(userId: number, input: CreateSavingInput): Promise<Saving> {
  const result = await db().query(
    `INSERT INTO savings (user_id, name, description, current_amount, goal_amount, storage_source_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      input.name,
      input.description || null,
      input.current_amount || 0,
      input.goal_amount || null,
      input.storage_source_id || null,
    ]
  );
  return result.rows[0];
}

export async function getSavingsByUser(userId: number): Promise<Saving[]> {
  const result = await db().query(
    'SELECT * FROM savings WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows;
}

export async function getSavingById(id: number, userId: number): Promise<Saving | null> {
  const result = await db().query(
    'SELECT * FROM savings WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateSaving(
  id: number,
  userId: number,
  input: Partial<CreateSavingInput>
): Promise<Saving | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }
  if (input.goal_amount !== undefined) {
    fields.push(`goal_amount = $${paramIndex++}`);
    values.push(input.goal_amount);
  }
  if (input.storage_source_id !== undefined) {
    fields.push(`storage_source_id = $${paramIndex++}`);
    values.push(input.storage_source_id);
  }

  if (fields.length === 0) return getSavingById(id, userId);

  fields.push(`updated_at = NOW()`);
  values.push(id, userId);

  const result = await db().query(
    `UPDATE savings SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteSaving(id: number, userId: number): Promise<boolean> {
  const result = await db().query(
    'DELETE FROM savings WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function depositToSaving(id: number, userId: number, amount: number): Promise<Saving | null> {
  const result = await db().query(
    `UPDATE savings SET current_amount = current_amount + $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [amount, id, userId]
  );
  return result.rows[0] || null;
}

export async function withdrawFromSaving(id: number, userId: number, amount: number): Promise<Saving | null> {
  const result = await db().query(
    `UPDATE savings SET current_amount = current_amount - $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND current_amount >= $1
     RETURNING *`,
    [amount, id, userId]
  );
  return result.rows[0] || null;
}

export async function getTotalSavings(userId: number): Promise<number> {
  const result = await db().query(
    'SELECT COALESCE(SUM(current_amount), 0) as total FROM savings WHERE user_id = $1',
    [userId]
  );
  return parseFloat(result.rows[0].total);
}
