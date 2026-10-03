import { CookieOptions, Response } from 'express';
import { env } from '../config/env';

const AUTH_COOKIE_NAME = 'token';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// El frontend llama a la API a través del proxy de Vercel (/api/*), así que
// para el navegador es el mismo origen: alcanza con SameSite=Strict.
function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, { ...getCookieOptions(), maxAge: THIRTY_DAYS_MS });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions());
}
