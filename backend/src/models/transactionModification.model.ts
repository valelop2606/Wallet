import { db } from '../database/connection';

export interface TransactionModification {
  id: number;
  transaction_id: number;
  user_id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: Date;
}

export async function createModification(
  transactionId: number,
  userId: number,
  field: string,
  oldValue: string | null,
  newValue: string | null
): Promise<TransactionModification> {
  const result = await db().query(
    `INSERT INTO transaction_modifications (transaction_id, user_id, field, old_value, new_value)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [transactionId, userId, field, oldValue, newValue]
  );
  return result.rows[0];
}

export async function getModificationsByTransaction(transactionId: number): Promise<TransactionModification[]> {
  const result = await db().query(
    'SELECT * FROM transaction_modifications WHERE transaction_id = $1 ORDER BY created_at DESC',
    [transactionId]
  );
  return result.rows;
}
