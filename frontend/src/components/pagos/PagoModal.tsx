import React from 'react';
import { pagoService } from '../../services/pago.service';
import { getTodayISO, getCurrentPeriod } from '../../utils/format';
import { getPeriodOptions } from '../../utils/periodo';
import { Modal } from '../ui/Modal';
import { PagoForm } from './PagoForm';
import type { PagoFormSubmit } from './PagoForm';

interface PagoModalProps {
  clienteId: number;
  clienteNombre: string;
  onClose: () => void;
  onSaved: () => void;
}

export const PagoModal: React.FC<PagoModalProps> = ({ clienteId, clienteNombre, onClose, onSaved }) => {
  const handleSubmit = async (values: PagoFormSubmit) => {
    await pagoService.registrar({ clienteId, ...values });
    onSaved();
    onClose();
  };

  return (
    <Modal title="Registrar pago" subtitle={clienteNombre} onClose={onClose}>
      <PagoForm
        idPrefix="pago"
        initialValues={{
          periodo: getCurrentPeriod(),
          monto: '',
          medioPago: { medio: 'Efectivo', otro: '' },
          fechaPago: getTodayISO(),
        }}
        // Últimos 3 meses, el actual y el siguiente
        periodOptions={getPeriodOptions(3, 1)}
        submitLabel="Registrar pago"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};
