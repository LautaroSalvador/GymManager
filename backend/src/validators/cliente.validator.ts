import { z } from 'zod';

/** Texto opcional: se recorta y un string vacío se guarda como null. */
const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional();

export const createClienteSchema = z.object({
  nombre: z.string().trim().min(1, 'Name is required').max(100),
  dni: optionalText(20),
  telefono: optionalText(30),
  calle: optionalText(100),
  altura: optionalText(10),
  fechaAlta: z.coerce.date({
    required_error: 'Registration date (fechaAlta) is required',
    invalid_type_error: 'Invalid date format',
  }),
});

export const updateClienteSchema = createClienteSchema.partial().extend({
  activo: z.boolean().optional(),
});
