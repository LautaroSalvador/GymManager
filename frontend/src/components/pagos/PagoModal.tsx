import React from 'react';
import { pagoService } from '../../services/pago.service';
import { getTodayISO, getCurrentPeriod } from '../../utils/format';
import { getPeriodOptions } from '../../utils/periodo';
import { Modal } from '../ui/Modal';
import { PagoForm } from './PagoForm';
import type { PagoFormSubmit } from './PagoForm';
import type { Periodo } from '../../types/cliente.types';

interface PagoModalProps {
  clienteId: number;
  clienteNombre: string;
  /** Meses vencidos sin pagar: se ofrecen en el selector y se propone el más viejo. */
  mesesAdeudados: Periodo[];
  onClose: () => void;
  onSaved: () => void;
}

export const PagoModal: React.FC<PagoModalProps> = ({
  clienteId,
  clienteNombre,
  mesesAdeudados,
  onClose,
  onSaved,
}) => {
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
          periodo: mesesAdeudados[0] ?? getCurrentPeriod(),
          monto: '',
          medioPago: { medio: 'Efectivo', otro: '' },
          fechaPago: getTodayISO(),
        }}
        // Últimos 3 meses, el actual, el siguiente y cualquier mes adeudado más viejo
        periodOptions={getPeriodOptions(3, 1, mesesAdeudados)}
        submitLabel="Registrar pago"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};
