import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '@prisma/client';
import { usuarioRepository } from '../repositories/usuario.repository';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export interface AuthTokenPayload {
  id: number;
  username: string;
  tokenVersion: number;
}

export interface AuthUser {
  id: number;
  username: string;
}

const BCRYPT_ROUNDS = 10;
const TOKEN_EXPIRATION = '30d';

export class AuthService {
  async login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const user = await usuarioRepository.findByUsername(username);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    return {
      token: this.signToken(user),
      user: { id: user.id, username: user.username },
    };
  }

  /**
   * Verifica el JWT y que su tokenVersion coincida con la del usuario.
   * Si la contraseña cambió después de emitido el token, se rechaza.
   */
  async verifyToken(token: string): Promise<AuthUser> {
    let payload: AuthTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw new AppError('Token is not valid', 401);
    }

    const user = await usuarioRepository.findById(payload.id);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new AppError('Token is not valid', 401);
    }

    return { id: user.id, username: user.username };
  }

  /**
   * Cambia la contraseña, revoca todas las sesiones existentes y devuelve
   * un token nuevo para que el dispositivo actual siga logueado.
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<string> {
    const user = await usuarioRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const updatedUser = await usuarioRepository.updatePasswordAndRevokeTokens(userId, newHash);
    return this.signToken(updatedUser);
  }

  private signToken(user: Usuario): string {
    const payload: AuthTokenPayload = {
      id: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
  }
}
export const authService = new AuthService();
