import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PasswordInput } from './PasswordInput';
import { StatusMessage } from './StatusMessage';
import type { FormStatus } from './StatusMessage';

const MIN_PASSWORD_LENGTH = 12;

export const CambiarContrasenaForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!currentPassword) {
      setStatus({ type: 'error', message: 'Ingresá tu contraseña actual.' });
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setStatus({
        type: 'error',
        message: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Las contraseñas nuevas no coinciden.' });
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setStatus({
        type: 'success',
        message: 'Contraseña actualizada. Se cerraron las sesiones de los demás dispositivos.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar la contraseña.';
      setStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        id="current-password"
        label="Contraseña actual"
        value={currentPassword}
        onChange={setCurrentPassword}
        disabled={saving}
        placeholder="Tu contraseña actual"
        autoComplete="current-password"
      />
      <PasswordInput
        id="new-password"
        label="Nueva contraseña"
        value={newPassword}
        onChange={setNewPassword}
        disabled={saving}
        placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
        autoComplete="new-password"
      />
      <PasswordInput
        id="confirm-password"
        label="Confirmar nueva contraseña"
        value={confirmPassword}
        onChange={setConfirmPassword}
        disabled={saving}
        placeholder="Repetí la nueva contraseña"
        autoComplete="new-password"
        showToggle={false}
      />

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <LoadingSpinner size="sm" /> : <Lock size={15} />}
          Cambiar contraseña
        </button>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </form>
  );
};
