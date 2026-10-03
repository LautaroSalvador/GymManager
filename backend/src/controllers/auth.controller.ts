import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator';
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const { token, user } = await authService.login(username, password);

      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      clearAuthCookie(res);

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const userId = req.user!.id;

      const token = await authService.changePassword(userId, currentPassword, newPassword);

      // Las demás sesiones quedaron revocadas; este dispositivo recibe un token nuevo.
      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}
export const authController = new AuthController();
