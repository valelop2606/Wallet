import { AsyncLocalStorage } from 'async_hooks';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config/env';

export interface Queryable {
  query<R extends QueryResultRow = any>(text: string, params?: unknown[]): Promise<QueryResult<R>>;
}

export interface PoolLike extends Queryable {
  connect(): Promise<Pick<PoolClient, 'query' | 'release'>>;
}

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
    };

export let pool: PoolLike = new Pool(poolConfig);

/** Swap the pool (used by integration tests to point at an in-memory Postgres). */
export function setPool(next: PoolLike): void {
  pool = next;
}

const txContext = new AsyncLocalStorage<Queryable>();

/**
 * Returns the client bound to the current transaction, or the pool when
 * called outside of `withTransaction`. Models always query through this.
 */
export function db(): Queryable {
  return txContext.getStore() ?? pool;
}

/**
 * Runs `fn` inside a single database transaction. Every model call made
 * (directly or indirectly) inside `fn` uses the same client, so either all
 * writes are committed or none are. Any thrown error triggers ROLLBACK.
 */
export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  if (txContext.getStore()) return fn(); // already inside a transaction

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await txContext.run(client as Queryable, fn);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
