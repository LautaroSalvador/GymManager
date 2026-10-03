import React, { useState } from 'react';
import { clienteService } from '../../services/cliente.service';
import type { Cliente } from '../../types/cliente.types';
import { getTodayISO } from '../../utils/format';
import { Modal, FormError } from '../ui/Modal';
import { FormField } from '../ui/FormField';

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

function getInitialForm(cliente?: Cliente | null): FormState {
  if (!cliente) {
    return { nombre: '', dni: '', telefono: '', calle: '', altura: '', fechaAlta: getTodayISO() };
  }
  return {
    nombre: cliente.nombre,
    dni: cliente.dni ?? '',
    telefono: cliente.telefono ?? '',
    calle: cliente.calle ?? '',
    altura: cliente.altura ?? '',
    fechaAlta: cliente.fechaAlta.slice(0, 10),
  };
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  cliente,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(cliente);

  // El modal se monta cada vez que se abre, así que alcanza con inicializar
  // el formulario una sola vez a partir del cliente (sin useEffect).
  const [form, setForm] = useState<FormState>(() => getInitialForm(cliente));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Props comunes a todos los inputs del formulario. */
  const inputProps = (name: keyof FormState) => ({
    id: `cliente-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    disabled: submitting,
  });

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
    <Modal title={isEditing ? 'Editar cliente' : 'Nuevo cliente'} onClose={onClose} size="md">
      {error && <FormError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre completo" htmlFor="cliente-nombre" required>
          <input {...inputProps('nombre')} type="text" required maxLength={100} placeholder="Juan Pérez" className="input-base" />
        </FormField>

        <FormField label="DNI" htmlFor="cliente-dni">
          <input {...inputProps('dni')} type="text" maxLength={20} placeholder="30.000.000" className="input-base" />
        </FormField>

        <FormField label="Teléfono" htmlFor="cliente-telefono">
          <input {...inputProps('telefono')} type="tel" maxLength={30} placeholder="+54 11 1234-5678" className="input-base" />
        </FormField>

        <FormField label="Dirección">
          <div className="flex gap-2">
            <input {...inputProps('calle')} type="text" maxLength={100} placeholder="Nombre de calle" className="input-base flex-1" />
            <input {...inputProps('altura')} type="text" maxLength={10} placeholder="Altura" className="input-base w-24" />
          </div>
        </FormField>

        <FormField
          label="Fecha de alta"
          htmlFor="cliente-fechaAlta"
          required
          hint={isEditing ? 'La fecha de alta no se puede modificar (determina el vencimiento mensual).' : undefined}
        >
          <input
            {...inputProps('fechaAlta')}
            type="date"
            required
            disabled={submitting || isEditing}
            className="input-base"
          />
        </FormField>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Dar de alta'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
