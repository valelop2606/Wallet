# Wallet

Aplicación de gestión financiera personal para organizar dinero, registrar movimientos y visualizar el progreso hacia objetivos y proyectos de vida.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS (Vite)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Auth:** JWT

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials

# Create database and run schema
psql -U postgres -c "CREATE DATABASE wallet;"
psql -U postgres -d wallet -f backend/src/database/schema.sql

# Start development
npm run dev
```

### Development URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## Project Structure

```
Wallet/
├── backend/     # Express API
├── frontend/    # React SPA
└── package.json # Workspace root
```
