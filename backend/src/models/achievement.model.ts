import { pool } from '../database/connection';

export interface Achievement {
  id: number;
  user_id: number;
  type: 'objective' | 'project';
  reference_id: number;
  name: string;
  description: string | null;
  amount: number | null;
  completed_at: Date;
  created_at: Date;
}

export async function createAchievement(
  userId: number,
  type: 'objective' | 'project',
  referenceId: number,
  name: string,
  description?: string,
  amount?: number
): Promise<Achievement> {
  const result = await pool.query(
    `INSERT INTO achievements (user_id, type, reference_id, name, description, amount)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, type, referenceId, name, description || null, amount || null]
  );
  return result.rows[0];
}

export async function getAchievementsByUser(userId: number): Promise<Achievement[]> {
  const result = await pool.query(
    'SELECT * FROM achievements WHERE user_id = $1 ORDER BY completed_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getAchievementsByType(userId: number, type: 'objective' | 'project'): Promise<Achievement[]> {
  const result = await pool.query(
    'SELECT * FROM achievements WHERE user_id = $1 AND type = $2 ORDER BY completed_at DESC',
    [userId, type]
  );
  return result.rows;
}
