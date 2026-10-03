import React from 'react';

interface ChartCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/** Tarjeta con encabezado para cada gráfico de Reportes. */
export const ChartCard: React.FC<ChartCardProps> = ({ icon: Icon, title, subtitle, children }) => (
  <section className="card p-5">
    <div className="flex items-center gap-2 mb-5">
      <div className="flex items-center justify-center w-8 h-8 bg-primary-50 rounded-lg">
        <Icon size={16} className="text-primary-600" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
        <p className="text-xs text-neutral-400">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

/** Mensaje para un gráfico sin datos. */
export const ChartEmpty: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-48 text-neutral-400 text-sm">{message}</div>
);
