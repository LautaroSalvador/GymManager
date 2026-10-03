import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../services/auth.service';
import { AuthContext } from './auth.context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(username, password);
      setUser(loggedUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Al montar: recuperar la sesión desde la cookie (si existe).
    authService
      .me()
      .then((currentUser) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // La API emite este evento ante un 401 (sesión vencida o revocada).
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
