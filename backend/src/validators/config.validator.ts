import { z } from 'zod';

export const updateConfigSchema = z.object({
  precioCuota: z.coerce.number().positive('Precio cuota must be positive'),
  umbralAlertaDias: z.coerce.number().int().nonnegative('Umbral must be non-negative'),
});
