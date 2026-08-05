import { pool } from '../database/connection';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

const SALT_ROUNDS = 12;

export async function createUser(input: CreateUserInput): Promise<Omit<User, 'password_hash'>> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [input.email, passwordHash, input.name]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<Omit<User, 'password_hash'> | null> {
  const result = await pool.query(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}
