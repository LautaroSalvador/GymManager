import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response) => Promise<unknown>;

/**
 * Envuelve un handler async y pasa cualquier error al middleware central
 * de errores. Evita repetir try/catch en cada controller (Express 4 no
 * captura por sí solo los rechazos de promesas).
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}
