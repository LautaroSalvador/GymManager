import React from 'react';

interface TooltipPayloadEntry {
  value: number;
  name: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  formatter?: (value: number) => string;
}

/** Tooltip de Recharts con el estilo de la app. */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, formatter }) => {
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
