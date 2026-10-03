import React from 'react';
import { pagoService } from '../../services/pago.service';
import { getPeriodOptions } from '../../utils/periodo';
import { Modal } from '../ui/Modal';
import { PagoForm } from './PagoForm';
import type { PagoFormSubmit } from './PagoForm';
import type { MedioPagoValue } from './MedioPagoSelector';
import type { Pago } from '../../types/pago.types';

interface PagoEditModalProps {
  pago: Pago;
  clienteNombre: string;
  onClose: () => void;
  onSaved: () => void;
}

function resolveInitialMedio(medioPago: string | null): MedioPagoValue {
  if (!medioPago || medioPago === 'Efectivo') return { medio: 'Efectivo', otro: '' };
  if (medioPago === 'Transferencia') return { medio: 'Transferencia', otro: '' };
  return { medio: 'Otro', otro: medioPago };
}

export const PagoEditModal: React.FC<PagoEditModalProps> = ({ pago, clienteNombre, onClose, onSaved }) => {
  const periodoPago = { mes: pago.periodoMes, anio: pago.periodoAnio };

  const handleSubmit = async (values: PagoFormSubmit) => {
    await pagoService.update(pago.id, values);
    onSaved();
    onClose();
  };

  return (
    <Modal title="Editar pago" subtitle={clienteNombre} onClose={onClose}>
      <PagoForm
        idPrefix="edit-pago"
        initialValues={{
          periodo: periodoPago,
          monto: String(pago.monto),
          medioPago: resolveInitialMedio(pago.medioPago),
          fechaPago: pago.fechaPago.slice(0, 10),
        }}
        // Últimos 12 meses y el siguiente, incluyendo siempre el período actual del pago
        periodOptions={getPeriodOptions(12, 1, [periodoPago])}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};
