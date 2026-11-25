process.env.NODE_ENV = 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import type { PGlite } from '@electric-sql/pglite';
import { setupTestDb } from './helpers/testDb';
import { createApp } from '../src/app';

const app = createApp();
let pg: PGlite;
let token: string;
const auth = () => ({ Authorization: `Bearer ${token}` });

async function createSource(name: string, balance: number): Promise<number> {
  const res = await request(app).post('/api/sources').set(auth()).send({ name, type: 'bank', balance });
  assert.equal(res.status, 201);
  return res.body.id;
}

async function balanceOf(id: number): Promise<number> {
  const res = await request(app).get(`/api/sources/${id}`).set(auth());
  return Number(res.body.balance);
}

before(async () => {
  pg = await setupTestDb();
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'Tester@Example.com', password: 'supersecret', name: 'Tester' });
  assert.equal(res.status, 201);
  token = res.body.token;
});

after(async () => {
  await pg.close();
});

describe('auth', () => {
  it('rejects invalid payloads with field-level errors', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'nope', password: '123' });
    assert.equal(res.status, 400);
    const fields = res.body.details.map((d: { field: string }) => d.field);
    assert.deepEqual(fields.sort(), ['email', 'name', 'password']);
  });

  it('normalizes email and rejects duplicates', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: '  tester@example.com ', password: 'supersecret', name: 'Dup' });
    assert.equal(res.status, 409);
  });

  it('logs in and rejects wrong passwords', async () => {
    const ok = await request(app).post('/api/auth/login').send({ email: 'tester@example.com', password: 'supersecret' });
    assert.equal(ok.status, 200);
    assert.ok(ok.body.token);

    const bad = await request(app).post('/api/auth/login').send({ email: 'tester@example.com', password: 'wrong-pass' });
    assert.equal(bad.status, 401);
  });

  it('protects private routes', async () => {
    const res = await request(app).get('/api/transactions');
    assert.equal(res.status, 401);
  });
});

describe('transactions', () => {
  it('applies expense, income and transfer to balances', async () => {
    const bank = await createSource('Bank', 1000);
    const cash = await createSource('Cash', 0);

    let res = await request(app).post('/api/transactions').set(auth()).send({ type: 'expense', amount: 200.5, source_id: bank });
    assert.equal(res.status, 201);
    res = await request(app).post('/api/transactions').set(auth()).send({ type: 'income', amount: 50, destination_id: cash });
    assert.equal(res.status, 201);
    res = await request(app)
      .post('/api/transactions')
      .set(auth())
      .send({ type: 'transfer', amount: 100, source_id: bank, destination_id: cash });
    assert.equal(res.status, 201);

    assert.equal(await balanceOf(bank), 699.5);
    assert.equal(await balanceOf(cash), 150);
  });

  it('validates type-specific fields and amounts', async () => {
    const bank = await createSource('Validation', 10);
    const cases = [
      { type: 'expense', amount: 5 }, // missing source
      { type: 'transfer', amount: 5, source_id: bank, destination_id: bank }, // same account
      { type: 'income', amount: -1, destination_id: bank },
      { type: 'income', amount: 1.234, destination_id: bank }, // >2 decimals
      { type: 'refund', amount: 5, destination_id: bank },
    ];
    for (const body of cases) {
      const res = await request(app).post('/api/transactions').set(auth()).send(body);
      assert.equal(res.status, 400, JSON.stringify(body));
    }
  });

  it('rejects an expense larger than the balance and leaves balance untouched', async () => {
    const bank = await createSource('Small', 30);
    const res = await request(app).post('/api/transactions').set(auth()).send({ type: 'expense', amount: 31, source_id: bank });
    assert.equal(res.status, 400);
    assert.equal(await balanceOf(bank), 30);
  });

  it('re-adjusts balances when the amount is edited and logs the change', async () => {
    const bank = await createSource('Edit', 500);
    const created = await request(app).post('/api/transactions').set(auth()).send({ type: 'expense', amount: 100, source_id: bank });

    const res = await request(app).put(`/api/transactions/${created.body.id}`).set(auth()).send({ amount: 40, description: 'Groceries' });
    assert.equal(res.status, 200);
    assert.equal(await balanceOf(bank), 460);
    assert.equal(res.body.modifications.length, 2);
  });

  it('voids a transfer once, reversing both sides', async () => {
    const a = await createSource('A', 300);
    const b = await createSource('B', 0);
    const tx = await request(app)
      .post('/api/transactions')
      .set(auth())
      .send({ type: 'transfer', amount: 120, source_id: a, destination_id: b });

    const first = await request(app).post(`/api/transactions/${tx.body.id}/void`).set(auth());
    assert.equal(first.status, 200);
    assert.equal(first.body.status, 'voided');

    const second = await request(app).post(`/api/transactions/${tx.body.id}/void`).set(auth());
    assert.equal(second.status, 400);

    assert.equal(await balanceOf(a), 300);
    assert.equal(await balanceOf(b), 0);
  });

  it("returns 404 for another user's source", async () => {
    const res = await request(app).post('/api/transactions').set(auth()).send({ type: 'expense', amount: 1, source_id: 999999 });
    assert.equal(res.status, 404);
  });
});

describe('frontend payload compatibility', () => {
  it('treats null optional fields as not provided', async () => {
    const bank = await createSource('Compat', 50);
    const tx = await request(app)
      .post('/api/transactions')
      .set(auth())
      .send({ type: 'expense', amount: 10, source_id: bank, destination_id: null, description: null });
    assert.equal(tx.status, 201);

    const edit = await request(app).put(`/api/transactions/${tx.body.id}`).set(auth()).send({ amount: null, description: 'Coffee' });
    assert.equal(edit.status, 200);
    assert.equal(await balanceOf(bank), 40);
  });
});

describe('atomicity', () => {
  it('rolls back the debit when depositing into a saving that does not exist', async () => {
    // Before: the source was debited, then the saving lookup failed -> money lost.
    const bank = await createSource('Atomic', 100);
    const res = await request(app).post('/api/savings/999999/deposit').set(auth()).send({ amount: 60, source_id: bank });
    assert.equal(res.status, 404);
    assert.equal(await balanceOf(bank), 100);
  });

  it('rolls back the debit when assigning money to a missing objective', async () => {
    const bank = await createSource('Atomic2', 100);
    const res = await request(app).post('/api/objectives/999999/assign').set(auth()).send({ amount: 60, source_id: bank });
    assert.equal(res.status, 400);
    assert.equal(await balanceOf(bank), 100);
  });

  it('rolls back the void when the destination no longer has the money', async () => {
    const a = await createSource('VoidA', 100);
    const b = await createSource('VoidB', 0);
    const tx = await request(app)
      .post('/api/transactions')
      .set(auth())
      .send({ type: 'transfer', amount: 100, source_id: a, destination_id: b });
    await request(app).post('/api/transactions').set(auth()).send({ type: 'expense', amount: 80, source_id: b });

    const res = await request(app).post(`/api/transactions/${tx.body.id}/void`).set(auth());
    assert.equal(res.status, 400);

    const after = await request(app).get(`/api/transactions/${tx.body.id}`).set(auth());
    assert.equal(after.body.status, 'active'); // status flip was rolled back too
    assert.equal(await balanceOf(a), 0);
    assert.equal(await balanceOf(b), 20);
  });
});

describe('platform', () => {
  it('serves the OpenAPI spec', async () => {
    const res = await request(app).get('/api/docs.json');
    assert.equal(res.status, 200);
    assert.equal(res.body.info.title, 'Wallet API');
  });

  it('returns JSON 400 on malformed JSON and JSON 404 on unknown API routes', async () => {
    const bad = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
    assert.equal(bad.status, 400);
    const missing = await request(app).get('/api/nope');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error, 'Not found');
  });

  it('sets security headers', async () => {
    const res = await request(app).get('/health');
    assert.ok(res.headers['x-content-type-options']);
    assert.equal(res.headers['x-powered-by'], undefined);
  });
});
