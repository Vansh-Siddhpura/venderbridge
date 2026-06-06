import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';

// Routers
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import vendorRoutes from './modules/vendors/routes';
import rfqRoutes from './modules/rfqs/routes';
import quotationRoutes from './modules/quotations/routes';
import approvalRoutes from './modules/approvals/routes';
import poRoutes from './modules/purchase-orders/routes';
import invoiceRoutes from './modules/invoices/routes';
import activityLogRoutes from './modules/activity-logs/routes';
import reportRoutes from './modules/reports/routes';
import dashboardRoutes from './modules/dashboard/routes';

const app: Express = express();

// ── Security & Utility Middlewares ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // required for httpOnly refresh token cookie
  })
);
app.use(express.json());
app.use(cookieParser());

// ── Logging (skipped in test env) ────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Skip rate limiting in development & tests to avoid frustrating local flows.
const skipLimiterInDev = (_req: express.Request) => env.NODE_ENV !== 'production';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // generous default for normal usage
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLimiterInDev,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  // Login attempts: only count failures to avoid locking out users typing fast
  max: Math.max(env.RATE_LIMIT_MAX_REQUESTS, 20),
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLimiterInDev,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many auth requests' } },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
// Alias for the frontend admin user-management screen
app.use('/api/admin/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'OK', timestamp: new Date() } });
});

// Handle 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export default app;
