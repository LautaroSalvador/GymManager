import { z } from 'zod';

export const createClienteSchema = z.object({
  nombre: z.string().min(1, 'Name is required').max(100),
  dni: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  calle: z.string().nullable().optional(),
  altura: z.string().nullable().optional(),
  fechaAlta: z.coerce.date({
    required_error: 'Registration date (fechaAlta) is required',
    invalid_type_error: 'Invalid date format',
  }),
});

export const updateClienteSchema = createClienteSchema.partial().extend({
  activo: z.boolean().optional(),
});
