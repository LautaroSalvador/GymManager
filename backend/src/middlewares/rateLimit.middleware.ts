import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const tooManyAttemptsResponse = {
  success: false,
  message: 'Demasiados intentos de inicio de sesión. Probá de nuevo más tarde.',
};

/**
 * Límite por IP: 5 intentos fallidos cada 15 minutos.
 * Los logins correctos no cuentan.
 */
export const loginRateLimitPorIp = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyAttemptsResponse,
});

/**
 * Límite global (todas las IPs juntas): 30 intentos fallidos por hora.
 * Protege aunque un atacante rote IPs o falsifique X-Forwarded-For.
 * Como hay un único usuario, no afecta el uso normal.
 */
export const loginRateLimitGlobal = rateLimit({
  windowMs: ONE_HOUR,
  limit: 30,
  skipSuccessfulRequests: true,
  keyGenerator: () => 'login-global',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyAttemptsResponse,
});
