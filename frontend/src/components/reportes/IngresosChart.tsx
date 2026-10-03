import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { ChartCard, ChartEmpty } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { formatCurrency } from '../../utils/format';
import type { ReporteHistoricoItem } from '../../services/reporte.service';

export interface MesSeleccionado {
  mes: number;
  anio: number;
  label: string;
}

interface IngresosChartProps {
  data: ReporteHistoricoItem[];
  selected: MesSeleccionado | null;
  onSelect: (mes: MesSeleccionado) => void;
}

/** Gráfico de barras de ingresos mensuales; al hacer clic en una barra se ve quiénes pagaron. */
export const IngresosChart: React.FC<IngresosChartProps> = ({ data, selected, onSelect }) => (
  <ChartCard icon={BarChart3} title="Ingresos mensuales" subtitle="Últimos 12 meses">
    {data.every((d) => d.valor === 0) ? (
      <ChartEmpty message="Sin datos de ingresos aún" />
    ) : (
      <>
        <p className="text-xs text-neutral-400 mb-3">Clic en una barra para ver quiénes pagaron ese mes</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: '#eff6ff' }} />
            <Bar
              dataKey="valor"
              radius={[4, 4, 0, 0]}
              name="Ingresos"
              style={{ cursor: 'pointer' }}
              onClick={(entry: unknown) => {
                const { mes, anio, label } = entry as MesSeleccionado;
                onSelect({ mes, anio, label });
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={selected?.mes === entry.mes && selected?.anio === entry.anio ? '#1d4ed8' : '#2563eb'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </>
    )}
  </ChartCard>
);
