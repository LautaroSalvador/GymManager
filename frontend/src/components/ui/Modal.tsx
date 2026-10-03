import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
};

/** Ventana modal con fondo oscuro, título y botón de cerrar. Se cierra al hacer clic afuera. */
export const Modal: React.FC<ModalProps> = ({ title, subtitle, onClose, size = 'sm', children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className={`card w-full ${SIZE_CLASSES[size]} p-6`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/** Caja de error para mostrar dentro de un formulario. */
export const FormError: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm mb-4">
    <AlertCircle size={15} className="shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);
