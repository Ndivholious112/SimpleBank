const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./startup/mongo');

dotenv.config();

const app = express();

// Allow multiple comma-separated origins via CORS_ORIGIN env (e.g. "http://localhost:5173,http://localhost:5174")
const corsOriginsEnv = process.env.CORS_ORIGIN || '*';
const allowedOrigins = corsOriginsEnv.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser or same-origin requests
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SimpleBank', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));

const port = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`SimpleBank backend listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to DB connection error', error);
    process.exit(1);
  });
