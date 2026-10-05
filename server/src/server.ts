import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthCheck, closePool } from './db/connection.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import uploadsRouter from './routes/uploads.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealthy = await healthCheck();
  if (dbHealthy) {
    res.json({ status: 'ok', database: 'connected' });
  } else {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// API Routes
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/uploads', uploadsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`✓ Server running at http://${HOST}:${PORT}`);
  console.log(`✓ Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
});

export default app;
