import { api } from './api';

export interface User {
  id: number;
  username: string;
}

export const authService = {
  async login(username: string, password: string): Promise<User> {
    const response = await api.post<{ user: User }>('/auth/login', { username, password });
    return response.user;
  },

  async logout(): Promise<void> {
    await api.post<void>('/auth/logout');
  },

  async me(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post<void>('/auth/change-password', { currentPassword, newPassword });
  },
};
