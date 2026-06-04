import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { env } from './config/env';

const app = express();

// ─── Orígenes permitidos para CORS ──────────────────────────────────────────
// En desarrollo: localhost.
// En producción: la(s) URL(s) de Vercel definidas en la variable FRONTEND_URL.
// FRONTEND_URL puede contener múltiples URLs separadas por coma, por ejemplo:
//   https://gymmanager.vercel.app,https://gymmanager-git-main-xxx.vercel.app
const allowedOrigins: string[] = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

if (env.FRONTEND_URL) {
  const productionOrigins = env.FRONTEND_URL.split(',').map((url) => url.trim());
  allowedOrigins.push(...productionOrigins);
}

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: Postman, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origen no permitido → ${origin}`));
    },
    credentials: true,
  })
);

// Body and cookie parsing middleware
app.use(cookieParser());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Centralized error handler
app.use(errorMiddleware);

export default app;

