import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  ADMIN_PASSWORD: z.string().min(4, 'ADMIN_PASSWORD must be at least 4 characters long').default('admin123'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // URL del frontend en producción (Vercel). Puede ser una lista separada por comas.
  // Ejemplo: "https://gymmanager.vercel.app,https://gymmanager-xxx.vercel.app"
  FRONTEND_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
