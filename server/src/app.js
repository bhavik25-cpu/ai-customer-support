import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-customer-support' });
});

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  }),
  authRoutes
);

app.use(
  '/api/chat',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 40,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  }),
  chatRoutes
);

app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error('[API error]', error);
  const status = error.status || (error.code === 11000 ? 409 : 500);
  res.status(status).json({
    message:
      status >= 500 && process.env.NODE_ENV === 'production'
        ? 'Server error. Please try again.'
        : error.message || 'Internal server error.'
  });
});

export default app;
