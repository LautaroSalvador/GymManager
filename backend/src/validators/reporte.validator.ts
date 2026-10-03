import { z } from 'zod';

export const pagosPorMesParamsSchema = z.object({
  mes: z.coerce.number().int().min(1, 'Mes inválido (1-12)').max(12, 'Mes inválido (1-12)'),
  anio: z.coerce.number().int().min(2000, 'Año inválido'),
});
