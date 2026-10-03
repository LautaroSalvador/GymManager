import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator';
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

/** El authMiddleware garantiza req.user en rutas protegidas; esto lo hace explícito. */
function getAuthenticatedUserId(req: Request): number {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }
  return req.user.id;
}

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = loginSchema.parse(req.body);
    const { token, user } = await authService.login(username, password);

    setAuthCookie(res, token);
    res.status(200).json({ success: true, user });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = getAuthenticatedUserId(req);

    const token = await authService.changePassword(userId, currentPassword, newPassword);

    // Las demás sesiones quedaron revocadas; este dispositivo recibe un token nuevo.
    setAuthCookie(res, token);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, user: req.user });
  }),
};
