import React from 'react';

/** Explica cómo se clasifica a los clientes en el dashboard. */
export const ReferenciaAlertas: React.FC<{ umbralAlertaDias: number }> = ({ umbralAlertaDias }) => (
  <ul className="space-y-3 text-sm text-neutral-700">
    <li className="flex items-start gap-2.5">
      <span className="badge badge-danger mt-0.5">Cobrar hoy</span>
      <span className="text-neutral-500">
        Clientes cuyo día de vencimiento coincide con hoy y aún no pagaron el mes actual.
      </span>
    </li>
    <li className="flex items-start gap-2.5">
      <span className="badge badge-warning mt-0.5">Próximos</span>
      <span className="text-neutral-500">
        Clientes que vencen en los próximos{' '}
        <strong className="text-neutral-700">{umbralAlertaDias} días</strong> y no pagaron aún.
      </span>
    </li>
    <li className="flex items-start gap-2.5">
      <span className="badge badge-danger mt-0.5">Con deuda</span>
      <span className="text-neutral-500">
        Clientes con al menos un mes vencido sin pagar, de este mes o de meses anteriores.
      </span>
    </li>
    <li className="flex items-start gap-2.5">
      <span className="badge badge-success mt-0.5">Al día</span>
      <span className="text-neutral-500">Clientes que no deben ningún mes vencido.</span>
    </li>
  </ul>
);
