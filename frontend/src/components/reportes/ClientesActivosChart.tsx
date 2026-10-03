import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import { ChartCard, ChartEmpty } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import type { ReporteHistoricoItem } from '../../services/reporte.service';

/** Gráfico de línea con la cantidad de clientes activos al cierre de cada mes. */
export const ClientesActivosChart: React.FC<{ data: ReporteHistoricoItem[] }> = ({ data }) => (
  <ChartCard icon={Users} title="Clientes activos en el tiempo" subtitle="Últimos 12 meses">
    {data.every((d) => d.valor === 0) ? (
      <ChartEmpty message="Sin datos de clientes aún" />
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip formatter={(v) => `${v} clientes`} />} />
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
  </ChartCard>
);
