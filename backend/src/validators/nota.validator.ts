import { z } from 'zod';

export const createNotaSchema = z.object({
  texto: z.string().trim().min(1, 'Note content cannot be empty'),
});
