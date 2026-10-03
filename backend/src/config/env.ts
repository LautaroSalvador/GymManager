import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  // Sin valor por defecto: si falta o es corto, el servidor no arranca.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // URL del frontend en producción (Vercel). Puede ser una lista separada por comas.
  // Ejemplo: "https://gymmanager.vercel.app,https://gymmanager-xxx.vercel.app"
  FRONTEND_URL: z.string().optional(),
  // Cantidad de proxies delante del servidor (Render = 1). Necesario para que
  // el rate limit lea la IP real del cliente desde X-Forwarded-For.
  TRUST_PROXY_HOPS: z.string().transform((val) => parseInt(val, 10)).default('0'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
