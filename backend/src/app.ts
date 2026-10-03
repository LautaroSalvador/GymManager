import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { env } from './config/env';

const app = express();

// Render (y Vercel) ponen proxies delante: sin esto req.ip sería la IP del proxy.
app.set('trust proxy', env.TRUST_PROXY_HOPS);

// Headers de seguridad estándar (X-Content-Type-Options, HSTS, etc.).
app.use(helmet());

// ─── Orígenes permitidos para CORS ──────────────────────────────────────────
// En producción el frontend llama a la API a través del proxy de Vercel
// (mismo origen), así que CORS solo hace falta para los orígenes listados en
// FRONTEND_URL (separados por coma). Localhost se permite únicamente en desarrollo.
const allowedOrigins: string[] = [];

if (env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

if (env.FRONTEND_URL) {
  const frontendOrigins = env.FRONTEND_URL.split(',').map((url) => url.trim());
  allowedOrigins.push(...frontendOrigins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: proxy de Vercel, curl, health checks de Render)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Sin headers CORS: el navegador bloquea la respuesta.
      callback(null, false);
    },
    credentials: true,
  })
);

// Body and cookie parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

// API Routes
app.use('/api', routes);

// Centralized error handler
app.use(errorMiddleware);

export default app;
