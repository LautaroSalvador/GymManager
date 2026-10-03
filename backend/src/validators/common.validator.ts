import { z } from 'zod';

/** Id numérico positivo recibido como route param (siempre llega como string). */
const positiveIntParam = z.coerce.number().int().positive();

export const idParamSchema = z.object({
  id: positiveIntParam,
});

export const clienteIdParamSchema = z.object({
  clienteId: positiveIntParam,
});
