import React from 'react';
import { CheckCircle2, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { ReporteResumen } from '../../services/reporte.service';

interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
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

/** Colores de la tarjeta de tasa de cobranza: verde ≥ 80 %, amarillo ≥ 50 %, rojo debajo. */
function getTasaColors(tasa: number): { iconBg: string; iconColor: string } {
  if (tasa >= 80) return { iconBg: 'bg-success-50', iconColor: 'text-success-600' };
  if (tasa >= 50) return { iconBg: 'bg-warning-50', iconColor: 'text-warning-600' };
  return { iconBg: 'bg-danger-50', iconColor: 'text-danger-600' };
}

export const ResumenMesActual: React.FC<{ resumen: ReporteResumen }> = ({ resumen }) => (
  <section>
    <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Mes actual</h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <SummaryCard
        label="Total cobrado"
        value={formatCurrency(resumen.totalCobrado)}
        icon={DollarSign}
        iconBg="bg-success-50"
        iconColor="text-success-600"
      />
      <SummaryCard
        label="Total esperado"
        value={formatCurrency(resumen.totalEsperado)}
        sub={`${resumen.clientesActivos} clientes activos`}
        icon={TrendingUp}
        iconBg="bg-primary-50"
        iconColor="text-primary-600"
      />
      <SummaryCard
        label="Clientes pagaron"
        value={`${resumen.clientesPagados} / ${resumen.clientesActivos}`}
        icon={CheckCircle2}
        iconBg="bg-success-50"
        iconColor="text-success-600"
      />
      <SummaryCard
        label="Tasa de cobranza"
        value={`${resumen.tasaCobranza}%`}
        icon={Percent}
        {...getTasaColors(resumen.tasaCobranza)}
      />
    </div>
  </section>
);
