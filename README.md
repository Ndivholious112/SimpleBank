# SimpleBank

A minimal banking demo built with Node.js/Express, MongoDB, and React (Vite).

## Prerequisites
- Node.js 18+
- MongoDB running locally (or provide `MONGODB_URI`)

## Backend

1. Create a `.env` in `backend/`:
```
MONGODB_URI=mongodb://localhost:27017/simplebank
PORT=5000
JWT_SECRET=your_secret
CORS_ORIGIN=http://localhost:5173
```
2. Start the server:
```
cd backend
npm run dev
```
Health: `GET http://localhost:5000/health`

## Frontend

Start the dev server:
```
cd frontend
npm run dev
```
App: `http://localhost:5173`

## Auth
- Register: `POST /api/auth/register` { name, email, password }
- Login: `POST /api/auth/login` -> `{ token, user }`

## Transactions (Bearer token required)
- List: `GET /api/transactions`
- Create: `POST /api/transactions` { amount, currency?, description? }
- Get by id: `GET /api/transactions/:id`

## Notes
- Frontend proxies `/api/*` to `http://localhost:5000` in dev.
- Simple CSS utilities included in `src/index.css`.
