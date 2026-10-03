import React, { useState } from 'react';
import { useReportes } from '../hooks/useReportes';
import { PagosMesModal } from '../components/reportes/PagosMesModal';
import { ResumenMesActual } from '../components/reportes/ResumenMesActual';
import { IngresosChart } from '../components/reportes/IngresosChart';
import type { MesSeleccionado } from '../components/reportes/IngresosChart';
import { ClientesActivosChart } from '../components/reportes/ClientesActivosChart';
import { PageLoading } from '../components/ui/PageLoading';
import { PageError } from '../components/ui/PageError';
import { RefreshCw } from 'lucide-react';

export const ReportesPage: React.FC = () => {
  const { data, loading, error, refresh } = useReportes();
  const [selectedMes, setSelectedMes] = useState<MesSeleccionado | null>(null);

  if (loading) {
    return <PageLoading message="Cargando reportes..." />;
  }

  if (error) {
    return <PageError message={error} onRetry={refresh} />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Reportes y Estadísticas</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Resumen de ingresos y actividad del gimnasio</p>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm hidden sm:flex">
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      <ResumenMesActual resumen={data.resumenMesActual} />

      <IngresosChart data={data.ingresosMensuales} selected={selectedMes} onSelect={setSelectedMes} />

      <ClientesActivosChart data={data.clientesActivosEvolucion} />

      {/* Modal drill-down: pagos del mes */}
      {selectedMes && (
        <PagosMesModal
          mes={selectedMes.mes}
          anio={selectedMes.anio}
          label={selectedMes.label}
          onClose={() => setSelectedMes(null)}
        />
      )}
    </div>
  );
};
