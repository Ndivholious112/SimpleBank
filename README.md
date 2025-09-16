

```markdown
# SimpleBank

**SimpleBank** is a minimal expense tracker built with **Node.js/Express**, **MongoDB**, and **React (Vite)**.  
It allows users to register, log in, and manage their personal expenses through a simple, clean interface.

## Prerequisites
- Node.js 18+
- MongoDB running locally (or provide `MONGODB_URI`)

## Backend

1. Create a `.env` in `backend/`:
```

MONGODB\_URI=mongodb://localhost:27017/simplebank
PORT=5000
JWT\_SECRET=your\_secret
CORS\_ORIGIN=[http://localhost:5173](http://localhost:5173)

```

2. Start the server:
```

cd backend
npm run dev

```

Health check:  
`GET http://localhost:5000/health`

## Frontend

Start the dev server:
```

cd frontend
npm run dev

```

App runs at:  
`http://localhost:5173`

## Authentication
- **Register**: `POST /api/auth/register` → `{ name, email, password }`
- **Login**: `POST /api/auth/login` → `{ token, user }`

## Expenses (Bearer token required)
- **List all expenses**: `GET /api/transactions`
- **Create an expense**: `POST /api/transactions` → `{ amount, currency?, description? }`
- **Get a single expense by id**: `GET /api/transactions/:id`

## Notes
- The frontend proxies `/api/*` to `http://localhost:5000` in development.
- Includes simple CSS utilities in `src/index.css`.
```

