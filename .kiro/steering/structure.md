# Project Structure

## Layout

```
Wallet/
├── .git/                   # Git version control
├── .gitignore              # Git ignore rules
├── .kiro/                  # Kiro IDE configuration
│   └── steering/           # AI assistant steering documents
├── package.json            # Root workspace configuration
├── README.md               # Project readme
│
├── backend/                # Node.js/Express API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example        # Environment variables template
│   └── src/
│       ├── index.ts            # Server entry point
│       ├── config/
│       │   └── env.ts          # Environment configuration
│       ├── controllers/        # Route handlers
│       │   └── auth.controller.ts
│       ├── database/
│       │   ├── connection.ts   # PostgreSQL pool
│       │   └── schema.sql      # Database schema
│       ├── middleware/
│       │   ├── auth.ts         # JWT authentication middleware
│       │   └── errorHandler.ts # Centralized error handling
│       ├── models/             # Data access layer
│       │   └── user.model.ts
│       ├── routes/             # API route definitions
│       │   ├── index.ts
│       │   └── auth.routes.ts
│       └── services/           # Business logic (to be added)
│
└── frontend/               # React SPA
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/
    │   └── vite.svg
    └── src/
        ├── main.tsx            # App entry point
        ├── App.tsx             # Root component with routing
        ├── index.css           # Global styles (Tailwind)
        ├── vite-env.d.ts       # Vite type declarations
        ├── components/         # Reusable UI components
        │   └── ProtectedRoute.tsx
        ├── hooks/              # Custom React hooks
        │   └── useAuth.tsx
        ├── pages/              # Page components
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   └── DashboardPage.tsx
        └── services/           # API client utilities
            └── api.ts
```

## Conventions

- Root directory: workspace config only (package.json, .gitignore)
- `backend/src/`: organized by concern (controllers, models, routes, services, middleware, database)
- `frontend/src/`: organized by type (components, pages, hooks, services)
- Configuration files belong at their respective package root
- Database schema lives in `backend/src/database/schema.sql`
- Environment variables go in `.env` files (never committed)
