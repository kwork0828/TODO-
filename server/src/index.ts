import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes';
import categoryRoutes from './routes/categoryRoutes';
import syncRoutes from './routes/syncRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { startPolling } from './services/googleSheetsSync';
import { checkAndUpdateOverdueTasks } from './services/overdueService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-schedule';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Security & Compression ───────────────────────────────────────────────────
app.use(helmet());
app.use(compression());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = NODE_ENV === 'production'
  ? [CLIENT_URL]
  : [CLIENT_URL, 'http://localhost:5173', 'http://localhost:80', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
});

const syncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: '동기화 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
});

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/tasks', apiLimiter, taskRoutes);
app.use('/api/categories', apiLimiter, categoryRoutes);
app.use('/api/sync', syncLimiter, syncRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: NODE_ENV })
);

app.get('/api/health', (_req: Request, res: Response) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: NODE_ENV })
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ message: '서버 오류가 발생했습니다.', error: NODE_ENV === 'development' ? err.message : undefined });
});

// ── Database & Server Start ───────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // (1) Run overdue check on startup
    await checkAndUpdateOverdueTasks();

    // (2) Hourly overdue check
    const ONE_HOUR = 60 * 60 * 1000;
    setInterval(async () => {
      console.log('[Hourly Cron] Running overdue check...');
      await checkAndUpdateOverdueTasks();
    }, ONE_HOUR);

    // (3) Google Sheets polling (only if credentials configured)
    if (process.env.GOOGLE_SHEETS_ID) {
      startPolling();
    } else {
      console.warn('[Sheets] GOOGLE_SHEETS_ID not set — polling disabled.');
    }

    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT} [${NODE_ENV}]`);
    });
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
