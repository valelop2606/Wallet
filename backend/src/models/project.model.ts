import { pool } from '../database/connection';

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'purchased';
  assigned_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export async function createProject(userId: number, input: CreateProjectInput): Promise<Project> {
  const result = await pool.query(
    `INSERT INTO projects (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, input.name, input.description || null]
  );
  return result.rows[0];
}

export async function getProjectsByUser(userId: number): Promise<Project[]> {
  const result = await pool.query(
    'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows;
}

export async function getProjectById(id: number, userId: number): Promise<Project | null> {
  const result = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateProject(
  id: number,
  userId: number,
  input: Partial<CreateProjectInput & { status: string }>
): Promise<Project | null> {
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
  if (input.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }

  if (fields.length === 0) return getProjectById(id, userId);

  fields.push(`updated_at = NOW()`);
  values.push(id, userId);

  const result = await pool.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteProject(id: number, userId: number): Promise<boolean> {
  // Unlink objectives first (set project_id to null)
  await pool.query(
    'UPDATE objectives SET project_id = NULL WHERE project_id = $1 AND user_id = $2',
    [id, userId]
  );
  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function assignMoneyToProject(
  id: number,
  userId: number,
  amount: number
): Promise<Project | null> {
  const result = await pool.query(
    `UPDATE projects SET assigned_amount = assigned_amount + $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND assigned_amount + $1 >= 0
     RETURNING *`,
    [amount, id, userId]
  );
  return result.rows[0] || null;
}

export async function getActiveProjects(userId: number): Promise<Project[]> {
  const result = await pool.query(
    `SELECT * FROM projects WHERE user_id = $1 AND status = 'active' ORDER BY created_at ASC`,
    [userId]
  );
  return result.rows;
}

export async function getProjectWithProgress(id: number, userId: number): Promise<Project & { objectives_total: number; objectives_current: number } | null> {
  const result = await pool.query(
    `SELECT p.*,
       COALESCE(SUM(o.target_amount), 0) as objectives_total,
       COALESCE(SUM(o.current_amount), 0) as objectives_current
     FROM projects p
     LEFT JOIN objectives o ON o.project_id = p.id
     WHERE p.id = $1 AND p.user_id = $2
     GROUP BY p.id`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function getTotalAssignedToProjects(userId: number): Promise<number> {
  const result = await pool.query(
    `SELECT COALESCE(SUM(assigned_amount), 0) as total FROM projects WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );
  return parseFloat(result.rows[0].total);
}
