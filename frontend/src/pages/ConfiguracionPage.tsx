import React from 'react';
import { useConfiguracion } from '../hooks/useConfiguracion';
import { PageLoading } from '../components/ui/PageLoading';
import { PageError } from '../components/ui/PageError';
import { ConfigSection } from '../components/configuracion/ConfigSection';
import { ConfigGeneralForm } from '../components/configuracion/ConfigGeneralForm';
import { CambiarContrasenaForm } from '../components/configuracion/CambiarContrasenaForm';
import { ReferenciaAlertas } from '../components/configuracion/ReferenciaAlertas';
import { Settings, DollarSign, Bell, Lock } from 'lucide-react';

export const ConfiguracionPage: React.FC = () => {
  const { config, setConfig, loading, error, refresh } = useConfiguracion();

  if (loading) {
    return <PageLoading message="Cargando configuración..." />;
  }

  if (error || !config) {
    return <PageError message={error ?? 'No se pudo cargar la configuración.'} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Settings size={20} className="text-neutral-400" />
          Configuración
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">Ajustes generales del gimnasio</p>
      </div>

      <ConfigSection
        icon={DollarSign}
        title="Precios y alertas"
        description="Configuración de cuotas y avisos del dashboard"
      >
        <ConfigGeneralForm
          precioCuota={config.precioCuota}
          umbralAlertaDias={config.umbralAlertaDias}
          onSaved={(precio, umbral) => setConfig({ precioCuota: precio, umbralAlertaDias: umbral })}
        />
      </ConfigSection>

      <ConfigSection
        icon={Bell}
        title="Referencia de alertas"
        description="Cómo se clasifican los clientes en el dashboard"
      >
        <ReferenciaAlertas umbralAlertaDias={config.umbralAlertaDias} />
      </ConfigSection>

      <ConfigSection
        icon={Lock}
        title="Seguridad"
        description="Cambiar la contraseña de acceso al sistema"
      >
        <CambiarContrasenaForm />
      </ConfigSection>
    </div>
  );
};
