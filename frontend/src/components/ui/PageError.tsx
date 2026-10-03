import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PageErrorProps {
  message: string;
  onRetry: () => void;
  /** Acciones extra al lado de "Reintentar" (ej: volver). */
  children?: React.ReactNode;
}

/** Mensaje de error con botón de reintento para cuando falla la carga de una página. */
export const PageError: React.FC<PageErrorProps> = ({ message, onRetry, children }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="flex items-center gap-2 text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-5 py-3">
      <AlertCircle size={18} />
      <span className="text-sm font-medium">{message}</span>
    </div>
    <div className="flex gap-3">
      <button onClick={onRetry} className="btn-secondary text-sm">
        <RefreshCw size={15} />
        Reintentar
      </button>
      {children}
    </div>
  </div>
);
