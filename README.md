# Wallet

Aplicacion de gestion financiera personal para organizar dinero, registrar movimientos y alcanzar objetivos de ahorro y compra.

## Demo en Produccion

| Servicio | URL |
|----------|-----|
| Frontend | [wallet-frontend-lake.vercel.app](https://wallet-frontend-lake.vercel.app) |
| Backend API | [wallet-backend-rwj5.onrender.com](https://wallet-backend-rwj5.onrender.com/health) |
| Base de datos | Neon PostgreSQL (free tier permanente) |

> El backend en Render free se suspende tras ~15 min de inactividad. La primera peticion puede tardar ~30s.

---

## Funcionalidades

### Autenticacion
- Registro de usuario con email y contrasena
- Login con JWT (token valido por 7 dias)
- Rutas protegidas en frontend y backend

### Fuentes de Dinero
- Crear multiples fuentes (billetera fisica, banco, etc.)
- Ver saldo individual y total
- Agregar y retirar dinero

### Transacciones
- Registrar ingresos, gastos y transferencias entre fuentes
- Historial completo con filtros
- Anulacion de transacciones (revierte el saldo)

### Objetivos (Completar vs Comprar)
- Crear objetivos con monto meta
- Asignar dinero progresivamente
- Estado **Completado**: junto todo el dinero, pero sigue reservado
- Estado **Comprado**: se registro el gasto real y el dinero sale de una fuente
- Quitar dinero asignado y devolverlo al disponible

### Proyectos
- Agrupar objetivos relacionados bajo un proyecto
- Seguimiento de progreso conjunto

### Ahorros
- Fondos de ahorro con meta opcional
- Separados del dinero disponible

### Dashboard
- Dinero disponible en tiempo real
- Desglose por fuentes
- Dinero asignado a objetivos
- Objetivos alcanzables con el saldo actual
- Patrimonio total
- Movimientos recientes
- **Acciones rapidas** (Agregar/Quitar) sin salir del inicio

### Logros
- Historial de objetivos completados y proyectos finalizados

---

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite 5 |
| Backend | Node.js + Express 4 + TypeScript |
| Base de datos | PostgreSQL (Neon) |
| Autenticacion | JWT + bcrypt |
| Package Manager | npm workspaces (monorepo) |

---

## Estructura del Proyecto

```
Wallet/
├── package.json            # Workspace root
├── backend/
│   ├── src/
│   │   ├── index.ts            # Entry point (Express server)
│   │   ├── config/env.ts       # Variables de entorno
│   │   ├── controllers/        # Logica de request/response
│   │   ├── models/             # Acceso a datos (queries SQL)
│   │   ├── routes/             # Definicion de rutas API
│   │   ├── middleware/         # Auth, error handler, async wrapper
│   │   └── database/
│   │       ├── connection.ts   # Pool PostgreSQL
│   │       ├── schema.sql      # DDL completo
│   │       └── seed.ts         # Script para crear tablas remotas
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # Entry point
│   │   ├── App.tsx             # Rutas (React Router)
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Paginas de la app
│   │   ├── hooks/              # Custom hooks (useAuth)
│   │   └── services/api.ts     # Cliente HTTP
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── .kiro/steering/             # Configuracion AI assistant
```

---

## Instalacion Local

### Requisitos
- Node.js 18+
- PostgreSQL 14+ (local o remota)

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/valelop2606/Wallet.git
cd Wallet

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de PostgreSQL

# 4. Crear las tablas
# Opcion A: con psql
psql -U postgres -d wallet -f backend/src/database/schema.sql

# Opcion B: con el script (para DB remotas)
cd backend
npx ts-node src/database/seed.ts "postgresql://user:pass@host/dbname?sslmode=require"
cd ..

# 5. Iniciar en desarrollo
npm run dev
```

### URLs de Desarrollo

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/health |

---

## Variables de Entorno

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallet
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=un_string_largo_y_seguro
JWT_EXPIRES_IN=7d
```

En produccion se usa `DATABASE_URL` en lugar de las variables individuales de DB.

### Frontend (`frontend/.env.production`)

```env
VITE_API_URL=https://wallet-backend-rwj5.onrender.com/api
```

En desarrollo no se necesita (usa proxy de Vite hacia `localhost:3001/api`).

---

## API Endpoints

### Auth
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/auth/register | Crear cuenta |
| POST | /api/auth/login | Iniciar sesion |

### Money Sources
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/sources | Listar fuentes |
| POST | /api/sources | Crear fuente |
| PUT | /api/sources/:id | Actualizar fuente |
| DELETE | /api/sources/:id | Eliminar fuente |

### Transactions
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/transactions | Listar transacciones |
| POST | /api/transactions | Crear transaccion |
| PUT | /api/transactions/:id | Actualizar transaccion |
| POST | /api/transactions/:id/void | Anular transaccion |

### Objectives
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/objectives | Listar objetivos |
| POST | /api/objectives | Crear objetivo |
| PUT | /api/objectives/:id | Actualizar objetivo |
| DELETE | /api/objectives/:id | Eliminar objetivo |
| POST | /api/objectives/:id/assign | Asignar dinero |
| POST | /api/objectives/:id/unassign | Quitar dinero |
| POST | /api/objectives/:id/purchase | Marcar como comprado |

### Projects
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/projects | Listar proyectos |
| POST | /api/projects | Crear proyecto |
| PUT | /api/projects/:id | Actualizar proyecto |
| DELETE | /api/projects/:id | Eliminar proyecto |

### Savings
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/savings | Listar ahorros |
| POST | /api/savings | Crear ahorro |
| PUT | /api/savings/:id | Actualizar ahorro |
| DELETE | /api/savings/:id | Eliminar ahorro |

### Dashboard
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/dashboard | Resumen completo del usuario |

---

## Deploy

### Backend — Render
- Web Service conectado a `main`
- Root Directory: `.` (raiz del monorepo)
- Build: `npm run render-build`
- Start: `npm start`
- Variables: `DATABASE_URL` (connection string de Neon), `NODE_ENV=production`

### Frontend — Vercel
- Framework: Vite
- Root Directory: `frontend`
- Build: `npm run build` (ejecuta `tsc -b && vite build`)
- La URL del backend se configura en `frontend/.env.production`

### Base de datos — Neon
- PostgreSQL free tier (permanente)
- Schema en `backend/src/database/schema.sql`

---

## Scripts Disponibles

```bash
# Desde la raiz
npm run dev              # Backend + Frontend simultaneo
npm run dev:backend      # Solo backend (ts-node-dev)
npm run dev:frontend     # Solo frontend (Vite)
npm run build            # Build completo (frontend + backend)
npm run build:backend    # Compilar TypeScript backend
npm run build:frontend   # Build produccion frontend
npm run render-build     # Build para Render (instala devDeps + build completo)
npm start                # Arranca el backend compilado (produccion)
```

---

## Autor

Desarrollado por **Valeria Lopez** — [@valelop2606](https://github.com/valelop2606)
