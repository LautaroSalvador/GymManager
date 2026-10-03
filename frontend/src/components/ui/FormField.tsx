import React from 'react';

interface FormFieldProps {
  label: string;
  /** id del input al que apunta el label (omitir si el campo agrupa varios inputs). */
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

/** Label + input(s) + ayuda opcional. Marca con * los obligatorios y con "(opcional)" el resto. */
export const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, required = false, hint, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-700">
      {label}{' '}
      {required ? (
        <span className="text-danger-500">*</span>
      ) : (
        <span className="text-neutral-400 font-normal">(opcional)</span>
      )}
    </label>
    {children}
    {hint && <p className="text-xs text-neutral-400">{hint}</p>}
  </div>
);
