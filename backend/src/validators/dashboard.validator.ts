import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  // Fecha de referencia opcional (YYYY-MM-DD), útil para probar escenarios.
  date: z.string().date().optional(),
});
