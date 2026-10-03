import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface FormStatus {
  type: 'success' | 'error';
  message: string;
}

/** Mensaje de resultado (éxito / error) debajo de un formulario. */
export const StatusMessage: React.FC<FormStatus> = ({ type, message }) => (
  <div
    className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 mt-4 ${
      type === 'success'
        ? 'bg-success-50 text-success-700 border border-success-100'
        : 'bg-danger-50 text-danger-600 border border-danger-100'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
    <span>{message}</span>
  </div>
);
