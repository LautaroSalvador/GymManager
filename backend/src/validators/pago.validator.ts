import { z } from 'zod';

export const createPagoSchema = z.object({
  clienteId: z.number().int('Client ID must be an integer'),
  fechaPago: z.coerce.date({
    required_error: 'Payment date is required',
    invalid_type_error: 'Invalid payment date',
  }),
  monto: z.number().positive('Amount must be positive'),
  periodoMes: z.number().int().min(1).max(12),
  periodoAnio: z.number().int().min(2000),
  medioPago: z.string().max(100).optional().nullable(),
});
