import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useReportes } from '../hooks/useReportes';
import { PagosMesModal } from '../components/reportes/PagosMesModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/format';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Users,
  CheckCircle2,
  Percent,
} from 'lucide-react';

// ─── Tipos auxiliares para Recharts ────────────────────────────────────────

interface TooltipPayloadEntry {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  formatter?: (value: number) => string;
}

// ─── Tooltip personalizado ──────────────────────────────────────────────────

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="card px-3 py-2 text-sm shadow-lg border border-neutral-200">
      <p className="font-semibold text-neutral-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-primary-600 font-medium">
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

// ─── Tarjeta de resumen ─────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${iconBg}`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-neutral-900 mt-0.5 truncate">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Página principal ───────────────────────────────────────────────────────

export const ReportesPage: React.FC = () => {
  const { data, loading, error, refresh } = useReportes();
  const [selectedMes, setSelectedMes] = useState<{ mes: number; anio: number; label: string } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <LoadingSpinner size="lg" />
          <p className="text-sm">Cargando reportes...</p>
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

  const { resumenMesActual, ingresosMensuales, clientesActivosEvolucion } = data;

  const tasaLabel = `${resumenMesActual.tasaCobranza}%`;
  const cobradoLabel = formatCurrency(resumenMesActual.totalCobrado);
  const esperadoLabel = formatCurrency(resumenMesActual.totalEsperado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Reportes y Estadísticas</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Resumen de ingresos y actividad del gimnasio</p>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm hidden sm:flex">
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Resumen del mes actual */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Mes actual
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Total cobrado"
            value={cobradoLabel}
            icon={DollarSign}
            iconBg="bg-success-50"
            iconColor="text-success-600"
          />
          <SummaryCard
            label="Total esperado"
            value={esperadoLabel}
            sub={`${resumenMesActual.clientesActivos} clientes activos`}
            icon={TrendingUp}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
          />
          <SummaryCard
            label="Clientes pagaron"
            value={`${resumenMesActual.clientesPagados} / ${resumenMesActual.clientesActivos}`}
            icon={CheckCircle2}
            iconBg="bg-success-50"
            iconColor="text-success-600"
          />
          <SummaryCard
            label="Tasa de cobranza"
            value={tasaLabel}
            icon={Percent}
            iconBg={
              resumenMesActual.tasaCobranza >= 80
                ? 'bg-success-50'
                : resumenMesActual.tasaCobranza >= 50
                ? 'bg-warning-50'
                : 'bg-danger-50'
            }
            iconColor={
              resumenMesActual.tasaCobranza >= 80
                ? 'text-success-600'
                : resumenMesActual.tasaCobranza >= 50
                ? 'text-warning-600'
                : 'text-danger-600'
            }
          />
        </div>
      </section>

      {/* Gráfico: Ingresos mensuales */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-50 rounded-lg">
            <BarChart3 size={16} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">Ingresos mensuales</h2>
            <p className="text-xs text-neutral-400">Últimos 12 meses</p>
          </div>
        </div>

        {ingresosMensuales.every((d) => d.valor === 0) ? (
          <div className="flex items-center justify-center h-48 text-neutral-400 text-sm">
            Sin datos de ingresos aún
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-400 mb-3">Clic en una barra para ver quiénes pagaron ese mes</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={ingresosMensuales}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip
                  content={<CustomTooltip formatter={(v) => formatCurrency(v)} />}
                  cursor={{ fill: '#eff6ff' }}
                />
                <Bar
                  dataKey="valor"
                  radius={[4, 4, 0, 0]}
                  name="Ingresos"
                  style={{ cursor: 'pointer' }}
                  onClick={(entry: { mes: number; anio: number; label: string }) =>
                    setSelectedMes({ mes: entry.mes, anio: entry.anio, label: entry.label })
                  }
                >
                  {ingresosMensuales.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        selectedMes?.mes === entry.mes && selectedMes?.anio === entry.anio
                          ? '#1d4ed8'
                          : '#2563eb'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </section>

      {/* Gráfico: Evolución de clientes activos */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-50 rounded-lg">
            <Users size={16} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">Clientes activos en el tiempo</h2>
            <p className="text-xs text-neutral-400">Últimos 12 meses</p>
          </div>
        </div>

        {clientesActivosEvolucion.every((d) => d.valor === 0) ? (
          <div className="flex items-center justify-center h-48 text-neutral-400 text-sm">
            Sin datos de clientes aún
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={clientesActivosEvolucion}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                content={
                  <CustomTooltip formatter={(v) => `${v} clientes`} />
                }
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
                name="Clientes"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Modal drill-down: pagos del mes */}
      {selectedMes && (
        <PagosMesModal
          mes={selectedMes.mes}
          anio={selectedMes.anio}
          label={selectedMes.label}
          onClose={() => setSelectedMes(null)}
        />
      )}
    </div>
  );
};
