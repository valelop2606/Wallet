import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Pool } from 'pg';

const connectionString = process.argv[2];

if (!connectionString) {
  console.error('Usage: npx ts-node src/database/seed.ts <DATABASE_URL>');
  process.exit(1);
}

async function run() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  const schemaPath = resolve(__dirname, 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf-8');

  console.log('Connecting to database...');
  
  try {
    await pool.query(sql);
    console.log('Schema created successfully!');
  } catch (error: any) {
    console.error('Error creating schema:', error.message);
  } finally {
    await pool.end();
  }
}

run();
