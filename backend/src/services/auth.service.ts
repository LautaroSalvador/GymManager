import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/usuario.repository';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export class AuthService {
  async login(username: string, password: string) {
    const user = await usuarioRepository.findByUsername(username);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    // Find admin user
    // Since there's only one user, we look up by ID
    const user = await usuarioRepository.findByUsername('admin');
    if (!user || user.id !== userId) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await usuarioRepository.updatePassword(userId, newHash);
  }
}
export const authService = new AuthService();
