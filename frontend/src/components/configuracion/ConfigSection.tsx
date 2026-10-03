import React from 'react';

interface ConfigSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

/** Tarjeta con encabezado (ícono, título, descripción) para cada bloque de Configuración. */
export const ConfigSection: React.FC<ConfigSectionProps> = ({ icon: Icon, title, description, children }) => (
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
