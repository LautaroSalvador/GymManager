import React from 'react';
import { ArrowLeftRight, Banknote, MoreHorizontal } from 'lucide-react';

export type MedioPagoOpcion = 'Efectivo' | 'Transferencia' | 'Otro';

export interface MedioPagoValue {
  medio: MedioPagoOpcion;
  /** Texto libre cuando el medio es "Otro". */
  otro: string;
}

const MEDIOS: { value: MedioPagoOpcion; label: string; icon: React.ElementType }[] = [
  { value: 'Efectivo',      label: 'Efectivo',      icon: Banknote },
  { value: 'Transferencia', label: 'Transferencia', icon: ArrowLeftRight },
  { value: 'Otro',          label: 'Otro',          icon: MoreHorizontal },
];

interface MedioPagoSelectorProps {
  id: string;
  value: MedioPagoValue;
  onChange: (value: MedioPagoValue) => void;
  disabled: boolean;
}

export const MedioPagoSelector: React.FC<MedioPagoSelectorProps> = ({ id, value, onChange, disabled }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-neutral-700">Medio de pago</label>
    <div className="grid grid-cols-3 gap-2">
      {MEDIOS.map(({ value: medio, label, icon: Icon }) => (
        <button
          key={medio}
          type="button"
          disabled={disabled}
          onClick={() => onChange({ ...value, medio })}
          className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all ${
            value.medio === medio
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>

    {/* Campo libre cuando se elige "Otro" */}
    {value.medio === 'Otro' && (
      <input
        id={id}
        type="text"
        placeholder="Ej: Débito, cheque..."
        disabled={disabled}
        value={value.otro}
        onChange={(e) => onChange({ ...value, otro: e.target.value })}
        className="input-base mt-2"
        autoFocus
        maxLength={100}
      />
    )}
  </div>
);
