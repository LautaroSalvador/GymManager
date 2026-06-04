import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, User as UserIcon, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username.trim().toLowerCase(), password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión. Intenta de nuevo.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Iniciar sesión</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Ingresá tus credenciales para continuar
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-username"
          className="block text-sm font-medium text-neutral-700"
        >
          Usuario
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <UserIcon size={16} />
          </div>
          <input
            id="login-username"
            type="text"
            required
            autoComplete="username"
            disabled={isSubmitting}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="input-base pl-9"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-neutral-700"
        >
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <KeyRound size={16} />
          </div>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            disabled={isSubmitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-base pl-9"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-2.5 mt-2"
      >
        {isSubmitting ? 'Verificando...' : 'Ingresar'}
      </button>
    </form>
  );
};
