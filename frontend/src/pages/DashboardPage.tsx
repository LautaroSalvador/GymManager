import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/dashboard/StatCard';
import { ClienteListSection } from '../components/dashboard/ClienteListSection';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/format';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Clock,
  CalendarClock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data, loading, error, refresh } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <LoadingSpinner size="lg" />
          <p className="text-sm">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex items-center gap-2 text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-5 py-3">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm">
          <RefreshCw size={15} />
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { indicadores, listas } = data;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Inicio</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary text-sm hidden sm:flex"
          title="Actualizar"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Clientes activos"
          value={indicadores.totalClientesActivos}
          icon={Users}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
        />
        <StatCard
          label="Al día este mes"
          value={indicadores.clientesAlDia}
          icon={CheckCircle2}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          label="Con deuda"
          value={indicadores.clientesConDeuda}
          icon={AlertTriangle}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
        />
        <StatCard
          label="Ingresos del mes"
          value={formatCurrency(indicadores.ingresosCobradosMesActual)}
          icon={DollarSign}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
      </div>

      {/* Client lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ClienteListSection
          title="Cobrar hoy"
          icon={Clock}
          iconColor="text-danger-600"
          iconBg="bg-danger-50"
          clients={listas.cobrarHoy}
          emptyMessage="Nadie vence hoy"
          badgeClass="badge-danger"
          badgeLabel="hoy"
        />
        <ClienteListSection
          title="Próximos a vencer"
          icon={CalendarClock}
          iconColor="text-warning-600"
          iconBg="bg-warning-50"
          clients={listas.proximosVencer}
          emptyMessage="Sin vencimientos próximos"
          badgeClass="badge-warning"
          badgeLabel="próximos"
        />
        <ClienteListSection
          title="Con deuda"
          icon={AlertTriangle}
          iconColor="text-danger-600"
          iconBg="bg-danger-50"
          clients={listas.conDeuda}
          emptyMessage="Sin deudores"
          badgeClass="badge-danger"
          badgeLabel="deuda"
        />
      </div>
    </div>
  );
};
