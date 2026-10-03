export interface HistorialActividad {
  fechaAlta: Date;
  activo: boolean;
  fechaBaja: Date | null;
  fechaReactivacion: Date | null;
}

/**
 * Indica si un cliente estaba activo en una fecha dada, a partir de su
 * fecha de alta y de su última baja / reactivación.
 *
 * Limitaciones conocidas:
 * - Solo se guarda la última baja y la última reactivación: si un cliente
 *   se dio de baja varias veces, los períodos inactivos anteriores no se ven.
 * - Clientes dados de baja antes de que existiera fechaBaja (activo = false
 *   y fechaBaja = null) no tienen fecha conocida: se excluyen siempre.
 */
export function estabaActivoEn(cliente: HistorialActividad, fecha: Date): boolean {
  if (cliente.fechaAlta > fecha) {
    return false;
  }

  if (!cliente.fechaBaja) {
    return cliente.activo;
  }

  // Todavía no se había dado de baja en esa fecha.
  if (cliente.fechaBaja > fecha) {
    return true;
  }

  // Se dio de baja antes de esa fecha: solo está activo si se reactivó después de la baja.
  const seReactivo =
    cliente.fechaReactivacion !== null &&
    cliente.fechaReactivacion >= cliente.fechaBaja &&
    cliente.fechaReactivacion <= fecha;

  return seReactivo;
}
