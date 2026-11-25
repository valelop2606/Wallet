# Wallet

Personal finance app to organize money across accounts, track income/expenses/transfers and save toward goals.
Full-stack TypeScript: **Express + PostgreSQL API** and **React** frontend, deployed on Render, Vercel and Neon.

| | URL |
|---|---|
| Frontend | [wallet-frontend-lake.vercel.app](https://wallet-frontend-lake.vercel.app) |
| API health | [wallet-backend-rwj5.onrender.com/health](https://wallet-backend-rwj5.onrender.com/health) |
| API docs (Swagger) | [wallet-backend-rwj5.onrender.com/api/docs](https://wallet-backend-rwj5.onrender.com/api/docs) |

> Render free tier sleeps after ~15 min idle; the first request can take ~30 s.

## Engineering highlights

- **Atomic money operations** — every balance change (transactions, edits, voids, savings, objectives) runs in a single Postgres transaction via `withTransaction()` + `AsyncLocalStorage`. A failure at any step rolls back everything; no half-applied transfers.
- **Race-safe voids and edits** — conditional `UPDATE … WHERE status = 'active'` / `SELECT … FOR UPDATE` so a transaction can't be reversed twice.
- **DB-level invariants** — `CHECK (balance >= 0)` and conditional updates guarantee balances never go negative.
- **Request validation with zod** — typed, normalized bodies and field-level `400` errors.
- **Security** — JWT auth, bcrypt, helmet headers, rate-limited auth endpoints, body size limit, per-user data isolation.
- **Integration tests on real Postgres without Docker** — supertest + [PGlite](https://pglite.dev) (Postgres compiled to WASM) run the real schema in memory. Tests cover auth, balance math, validation and rollback scenarios.
- **OpenAPI / Swagger UI** at `/api/docs`.
- **CI** — GitHub Actions runs typecheck and tests on every push and PR.

## Features

- **Auth** — register/login with JWT (7-day tokens).
- **Money sources** — wallets, bank accounts, etc. with individual and total balance.
- **Transactions** — income, expense and transfer; edit amount/description with full change history; void with automatic balance reversal.
- **Objectives** — assign money progressively; *completed* (money reserved) vs *purchased* (real expense recorded).
- **Projects** — group related objectives and track joint progress.
- **Savings** — savings funds with optional goals, separate from available money.
- **Dashboard** — available money, breakdown by source, reserved money, reachable goals, net worth, recent activity.
- **Achievements** — history of completed objectives and projects.

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express 4, TypeScript, pg, zod, helmet, express-rate-limit |
| Database | PostgreSQL (Neon) |
| Auth | JWT + bcrypt |
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Testing | node:test, supertest, PGlite |
| Infra | Render (API), Vercel (frontend), Neon (DB), GitHub Actions |

## Project structure

```
backend/
  src/
    app.ts              # Express app factory (used by server and tests)
    index.ts            # Server entry point
    controllers/        # Request handlers
    models/             # SQL data access (parameterized queries)
    routes/             # Routes + validation middleware
    validation/         # zod schemas
    middleware/         # auth, validation, async wrapper, error handler
    database/           # pool + withTransaction, schema.sql, seed
    docs/openapi.ts     # OpenAPI spec
  tests/                # unit + API integration tests
frontend/
  src/                  # pages, components, hooks, API client
```

## Running locally

Requirements: Node 20+, PostgreSQL 14+.

```bash
git clone https://github.com/valelop2606/Wallet.git
cd Wallet
npm install

cp backend/.env.example backend/.env   # fill in DB credentials and JWT_SECRET
psql -U postgres -d wallet -f backend/src/database/schema.sql

npm run dev        # API on :3001, frontend on :5173
```

### Tests

```bash
npm test --workspace=backend   # no database needed
```

### Environment variables (backend)

| Variable | Description |
|---|---|
| `PORT` | API port (default 3000) |
| `DATABASE_URL` | Postgres connection string (production) — or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| `JWT_SECRET` | **Required in production** |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CORS_ORIGIN` | Comma-separated allowed origins (default: any) |

Frontend: `VITE_API_URL` (only needed in production; dev uses the Vite proxy).

## API

Full interactive reference at **`/api/docs`**. Summary:

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Money sources | `GET/POST /api/sources`, `GET/PUT/DELETE /api/sources/:id` |
| Transactions | `GET/POST /api/transactions`, `GET/PUT /api/transactions/:id`, `GET /api/transactions/:id/modifications`, `POST /api/transactions/:id/void` |
| Objectives | CRUD + `POST /api/objectives/:id/{assign,unassign,purchase}` |
| Projects | CRUD |
| Savings | CRUD + `POST /api/savings/:id/{deposit,withdraw}` |
| Dashboard | `GET /api/dashboard` |

## Deploy

- **API — Render**: build `npm run render-build`, start `npm start`, env `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
- **Frontend — Vercel**: root `frontend`, framework Vite.
- **DB — Neon**: schema in `backend/src/database/schema.sql`.

## Author

**Valeria López** — [@valelop2606](https://github.com/valelop2606)
