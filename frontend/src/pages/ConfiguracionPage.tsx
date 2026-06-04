import React, { useState, useEffect } from 'react';
import { useConfiguracion } from '../hooks/useConfiguracion';
import { configService } from '../services/config.service';
import { authService } from '../services/auth.service';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  Settings,
  DollarSign,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

// ─── Componente de sección con título ───────────────────────────────────────

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon: Icon, title, description, children }) => (
  <div className="card overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 bg-neutral-50">
      <div className="flex items-center justify-center w-8 h-8 bg-primary-50 rounded-lg shrink-0">
        <Icon size={16} className="text-primary-600" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Mensaje de estado (éxito / error) ──────────────────────────────────────

interface StatusMessageProps {
  type: 'success' | 'error';
  message: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => (
  <div
    className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 mt-4 ${
      type === 'success'
        ? 'bg-success-50 text-success-700 border border-success-100'
        : 'bg-danger-50 text-danger-600 border border-danger-100'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
    <span>{message}</span>
  </div>
);

// ─── Sección: Precio de cuota y umbral de alerta ────────────────────────────

interface ConfigGeneralProps {
  precioCuota: number;
  umbralAlertaDias: number;
  onSaved: (precioCuota: number, umbralAlertaDias: number) => void;
}

const ConfigGeneral: React.FC<ConfigGeneralProps> = ({
  precioCuota,
  umbralAlertaDias,
  onSaved,
}) => {
  const [precio, setPrecio] = useState(precioCuota.toString());
  const [umbral, setUmbral] = useState(umbralAlertaDias.toString());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync when props change (e.g. after reload)
  useEffect(() => {
    setPrecio(precioCuota.toString());
    setUmbral(umbralAlertaDias.toString());
  }, [precioCuota, umbralAlertaDias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const precioNum = parseFloat(precio);
    const umbralNum = parseInt(umbral, 10);

    if (isNaN(precioNum) || precioNum <= 0) {
      setStatus({ type: 'error', message: 'El precio de la cuota debe ser un número positivo.' });
      return;
    }
    if (isNaN(umbralNum) || umbralNum < 1 || umbralNum > 30) {
      setStatus({ type: 'error', message: 'El umbral de alerta debe ser entre 1 y 30 días.' });
      return;
    }

    setSaving(true);
    try {
      await configService.update(precioNum, umbralNum);
      onSaved(precioNum, umbralNum);
      setStatus({ type: 'success', message: 'Configuración guardada correctamente.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la configuración.';
      setStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="precio-cuota" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Precio de la cuota mensual
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">
            $
          </span>
          <input
            id="precio-cuota"
            type="number"
            min="1"
            step="1"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            disabled={saving}
            className="input-base pl-7"
            placeholder="15000"
          />
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Aplica a nuevos registros. No modifica el historial de pagos existente.
        </p>
      </div>

      <div>
        <label htmlFor="umbral-alerta" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Días de alerta antes del vencimiento
        </label>
        <div className="relative">
          <input
            id="umbral-alerta"
            type="number"
            min="1"
            max="30"
            step="1"
            value={umbral}
            onChange={(e) => setUmbral(e.target.value)}
            disabled={saving}
            className="input-base pr-14"
            placeholder="3"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
            días
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Clientes que vencen en los próximos N días aparecen en "Próximos a vencer" del dashboard.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <LoadingSpinner size="sm" /> : <Save size={15} />}
          Guardar cambios
        </button>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </form>
  );
};

// ─── Sección: Cambio de contraseña ─────────────────────────────────────────

const CambiarContrasena: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!currentPassword) {
      setStatus({ type: 'error', message: 'Ingresá tu contraseña actual.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Las contraseñas nuevas no coinciden.' });
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setStatus({ type: 'success', message: 'Contraseña actualizada correctamente.' });
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
      <div>
        <label htmlFor="current-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Contraseña actual
        </label>
        <div className="relative">
          <input
            id="current-password"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={saving}
            className="input-base pr-10"
            placeholder="Tu contraseña actual"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            tabIndex={-1}
          >
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={saving}
            className="input-base pr-10"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            tabIndex={-1}
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Confirmar nueva contraseña
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={saving}
          className="input-base"
          placeholder="Repetí la nueva contraseña"
          autoComplete="new-password"
        />
      </div>

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

// ─── Página principal ───────────────────────────────────────────────────────

export const ConfiguracionPage: React.FC = () => {
  const { config, setConfig, loading, error, refresh } = useConfiguracion();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <LoadingSpinner size="lg" />
          <p className="text-sm">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex items-center gap-2 text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-5 py-3">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error ?? 'No se pudo cargar la configuración.'}</span>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm">
          <RefreshCw size={15} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Settings size={20} className="text-neutral-400" />
          Configuración
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">Ajustes generales del gimnasio</p>
      </div>

      {/* Sección general */}
      <Section
        icon={DollarSign}
        title="Precios y alertas"
        description="Configuración de cuotas y avisos del dashboard"
      >
        <ConfigGeneral
          precioCuota={config.precioCuota}
          umbralAlertaDias={config.umbralAlertaDias}
          onSaved={(precio, umbral) =>
            setConfig({ precioCuota: precio, umbralAlertaDias: umbral })
          }
        />
      </Section>

      {/* Sección de alertas — visual reference */}
      <Section
        icon={Bell}
        title="Referencia de alertas"
        description="Cómo se clasifican los clientes en el dashboard"
      >
        <ul className="space-y-3 text-sm text-neutral-700">
          <li className="flex items-start gap-2.5">
            <span className="badge badge-danger mt-0.5">Cobrar hoy</span>
            <span className="text-neutral-500">
              Clientes cuyo día de vencimiento coincide con hoy y aún no pagaron el mes actual.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="badge badge-warning mt-0.5">Próximos</span>
            <span className="text-neutral-500">
              Clientes que vencen en los próximos{' '}
              <strong className="text-neutral-700">{config.umbralAlertaDias} días</strong> y no pagaron aún.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="badge badge-danger mt-0.5">Con deuda</span>
            <span className="text-neutral-500">
              Clientes cuyo vencimiento ya pasó en este mes y no registraron pago.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="badge badge-success mt-0.5">Al día</span>
            <span className="text-neutral-500">
              Clientes con pago registrado para el mes actual.
            </span>
          </li>
        </ul>
      </Section>

      {/* Sección cambio de contraseña */}
      <Section
        icon={Lock}
        title="Seguridad"
        description="Cambiar la contraseña de acceso al sistema"
      >
        <CambiarContrasena />
      </Section>
    </div>
  );
};
