import React, { useState, useEffect } from 'react';
import { clienteService } from '../../services/cliente.service';
import type { Cliente } from '../../types/cliente.types';
import { getTodayISO } from '../../utils/format';
import { X, AlertCircle } from 'lucide-react';

interface ClienteModalProps {
  /** If provided, the modal is in edit mode. */
  cliente?: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nombre: string;
  dni: string;
  telefono: string;
  calle: string;
  altura: string;
  fechaAlta: string;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  cliente,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(cliente);

  const [form, setForm] = useState<FormState>({
    nombre: '',
    dni: '',
    telefono: '',
    calle: '',
    altura: '',
    fechaAlta: getTodayISO(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        dni: cliente.dni ?? '',
        telefono: cliente.telefono ?? '',
        calle: cliente.calle ?? '',
        altura: cliente.altura ?? '',
        fechaAlta: cliente.fechaAlta.slice(0, 10),
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        dni: form.dni.trim() || null,
        telefono: form.telefono.trim() || null,
        calle: form.calle.trim() || null,
        altura: form.altura.trim() || null,
        fechaAlta: form.fechaAlta,
      };

      if (isEditing && cliente) {
        await clienteService.update(cliente.id, payload);
      } else {
        await clienteService.create(payload);
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el cliente';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-neutral-900">
            {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm mb-4">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="cliente-nombre" className="block text-sm font-medium text-neutral-700">
              Nombre completo <span className="text-danger-500">*</span>
            </label>
            <input
              id="cliente-nombre"
              name="nombre"
              type="text"
              required
              disabled={submitting}
              value={form.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className="input-base"
            />
          </div>

          {/* DNI */}
          <div className="space-y-1.5">
            <label htmlFor="cliente-dni" className="block text-sm font-medium text-neutral-700">
              DNI <span className="text-neutral-400 font-normal">(opcional)</span>
            </label>
            <input
              id="cliente-dni"
              name="dni"
              type="text"
              disabled={submitting}
              value={form.dni}
              onChange={handleChange}
              placeholder="30.000.000"
              className="input-base"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label htmlFor="cliente-telefono" className="block text-sm font-medium text-neutral-700">
              Teléfono <span className="text-neutral-400 font-normal">(opcional)</span>
            </label>
            <input
              id="cliente-telefono"
              name="telefono"
              type="tel"
              disabled={submitting}
              value={form.telefono}
              onChange={handleChange}
              placeholder="+54 11 1234-5678"
              className="input-base"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700">
              Dirección <span className="text-neutral-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="cliente-calle"
                name="calle"
                type="text"
                disabled={submitting}
                value={form.calle}
                onChange={handleChange}
                placeholder="Nombre de calle"
                className="input-base flex-1"
              />
              <input
                id="cliente-altura"
                name="altura"
                type="text"
                disabled={submitting}
                value={form.altura}
                onChange={handleChange}
                placeholder="Altura"
                className="input-base w-24"
              />
            </div>
          </div>

          {/* Fecha de alta */}
          <div className="space-y-1.5">
            <label htmlFor="cliente-fecha-alta" className="block text-sm font-medium text-neutral-700">
              Fecha de alta <span className="text-danger-500">*</span>
            </label>
            <input
              id="cliente-fecha-alta"
              name="fechaAlta"
              type="date"
              required
              disabled={submitting || isEditing}
              value={form.fechaAlta}
              onChange={handleChange}
              className="input-base"
            />
            {isEditing && (
              <p className="text-xs text-neutral-400">
                La fecha de alta no se puede modificar (determina el vencimiento mensual).
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Dar de alta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
