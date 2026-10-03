import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/errors';

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const token: unknown = req.cookies?.token;

  if (typeof token !== 'string' || !token) {
    return next(new AppError('No token, authorization denied', 401));
  }

  try {
    req.user = await authService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
};
