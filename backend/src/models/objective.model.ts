import { pool } from '../database/connection';

export interface Objective {
  id: number;
  user_id: number;
  project_id: number | null;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'purchased';
  priority: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateObjectiveInput {
  name: string;
  description?: string;
  target_amount: number;
  project_id?: number;
}

export async function createObjective(userId: number, input: CreateObjectiveInput): Promise<Objective> {
  const result = await pool.query(
    `INSERT INTO objectives (user_id, name, description, target_amount, project_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, input.name, input.description || null, input.target_amount, input.project_id || null]
  );
  return result.rows[0];
}

export async function getObjectivesByUser(userId: number): Promise<Objective[]> {
  const result = await pool.query(
    'SELECT * FROM objectives WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows;
}

export async function getObjectiveById(id: number, userId: number): Promise<Objective | null> {
  const result = await pool.query(
    'SELECT * FROM objectives WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function getObjectivesByProject(projectId: number, userId: number): Promise<Objective[]> {
  const result = await pool.query(
    'SELECT * FROM objectives WHERE project_id = $1 AND user_id = $2 ORDER BY priority ASC, created_at ASC',
    [projectId, userId]
  );
  return result.rows;
}

export async function updateObjective(
  id: number,
  userId: number,
  input: Partial<CreateObjectiveInput & { status: string; project_id: number | null }>
): Promise<Objective | null> {
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
  if (input.target_amount !== undefined) {
    fields.push(`target_amount = $${paramIndex++}`);
    values.push(input.target_amount);
  }
  if (input.project_id !== undefined) {
    fields.push(`project_id = $${paramIndex++}`);
    values.push(input.project_id);
  }
  if (input.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }

  if (fields.length === 0) return getObjectiveById(id, userId);

  fields.push(`updated_at = NOW()`);
  values.push(id, userId);

  const result = await pool.query(
    `UPDATE objectives SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteObjective(id: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM objectives WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function assignMoneyToObjective(
  id: number,
  userId: number,
  amount: number
): Promise<Objective | null> {
  const result = await pool.query(
    `UPDATE objectives 
     SET current_amount = current_amount + $1,
         status = CASE 
           WHEN current_amount + $1 >= target_amount THEN 'completed'
           WHEN current_amount + $1 > 0 THEN 'in_progress'
           ELSE status
         END,
         updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND current_amount + $1 >= 0
     RETURNING *`,
    [amount, id, userId]
  );
  return result.rows[0] || null;
}

export async function unassignMoneyFromObjective(
  id: number,
  userId: number,
  amount: number
): Promise<Objective | null> {
  const result = await pool.query(
    `UPDATE objectives 
     SET current_amount = current_amount - $1,
         status = CASE 
           WHEN current_amount - $1 <= 0 THEN 'pending'
           WHEN current_amount - $1 < target_amount THEN 'in_progress'
           ELSE status
         END,
         updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND current_amount - $1 >= 0
     RETURNING *`,
    [amount, id, userId]
  );
  return result.rows[0] || null;
}

export async function getActiveObjectives(userId: number): Promise<Objective[]> {
  const result = await pool.query(
    `SELECT * FROM objectives WHERE user_id = $1 AND status IN ('pending', 'in_progress') ORDER BY created_at ASC`,
    [userId]
  );
  return result.rows;
}

export async function getTotalAssignedToObjectives(userId: number): Promise<number> {
  const result = await pool.query(
    `SELECT COALESCE(SUM(current_amount), 0) as total FROM objectives WHERE user_id = $1 AND status IN ('pending', 'in_progress', 'completed')`,
    [userId]
  );
  return parseFloat(result.rows[0].total);
}
