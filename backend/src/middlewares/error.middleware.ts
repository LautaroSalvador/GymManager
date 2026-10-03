import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

/** Error que lanza express.json() cuando el body no es JSON válido. */
function isJsonSyntaxError(err: Error): boolean {
  return err instanceof SyntaxError && 'body' in err;
}

function sendError(res: Response, statusCode: number, message: string) {
  return res.status(statusCode).json({ success: false, message });
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  // Express identifica a los error handlers por tener 4 parámetros.
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return sendError(res, 400, `Validation failed: ${messages}`);
  }

  if (isJsonSyntaxError(err)) {
    return sendError(res, 400, 'El cuerpo de la request no es JSON válido');
  }

  // P2025: se intentó modificar o borrar un registro que no existe.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return sendError(res, 404, 'Registro no encontrado');
  }

  // Error inesperado: el detalle queda solo en el log del servidor, nunca en la respuesta
  // (podría exponer nombres de tablas, campos o consultas).
  console.error('Unexpected error:', err);
  return sendError(res, 500, 'Error interno del servidor');
};
