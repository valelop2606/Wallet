import { readFileSync } from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import { setPool, PoolLike } from '../../src/database/connection';

/**
 * Boots an in-memory Postgres (PGlite, real Postgres compiled to WASM),
 * applies the production schema and plugs it into the app's pool.
 * No Docker or external database needed to run the integration tests.
 */
export async function setupTestDb(): Promise<PGlite> {
  const pg = await PGlite.create();
  const schema = readFileSync(path.join(__dirname, '../../src/database/schema.sql'), 'utf8');
  await pg.exec(schema);

  const query: PoolLike['query'] = async (text, params) => {
    const r = await pg.query(text, params as unknown[]);
    return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length } as never;
  };

  setPool({
    query,
    // PGlite is a single connection: tests run requests sequentially, so
    // BEGIN/COMMIT issued through this "client" behave like a real pool client.
    connect: async () => ({ query, release: () => undefined }) as never,
  });

  return pg;
}
