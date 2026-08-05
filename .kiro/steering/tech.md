# Tech Stack

## Language & Runtime

- TypeScript 5.6+
- Node.js (backend runtime)
- Browser (frontend runtime via Vite)

## Package Manager

- npm with workspaces (monorepo)
- Root `package.json` manages both `frontend/` and `backend/` workspaces

## Frontend

- React 18
- Vite 5 (dev server and build tool)
- Tailwind CSS 3
- React Router DOM 6
- PostCSS + Autoprefixer

## Backend

- Express 4
- PostgreSQL (via `pg` driver)
- JWT authentication (`jsonwebtoken`)
- bcrypt for password hashing
- dotenv for environment config
- ts-node-dev for development

## Common Commands

```bash
# Install all dependencies (from root)
npm install

# Development
npm run dev:backend     # Start backend dev server (port 3000)
npm run dev:frontend    # Start frontend dev server (port 5173)
npm run dev             # Start both concurrently

# Build
npm run build:backend   # Compile backend TypeScript
npm run build:frontend  # Build frontend for production

# Backend only
cd backend
npm run dev             # ts-node-dev with auto-restart
npm run build           # tsc compilation
npm start               # Run compiled JS from dist/
```

## Environment Configuration

- Backend uses `.env` file (see `backend/.env.example`)
- Required variables: PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN
- Frontend proxies `/api` requests to backend via Vite config

## Testing

- No test framework configured yet. Recommended: Vitest (frontend), Jest (backend)
