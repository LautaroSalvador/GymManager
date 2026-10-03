export interface CreateClienteData {
  nombre: string;
  dni?: string | null;
  telefono?: string | null;
  calle?: string | null;
  altura?: string | null;
  fechaAlta: Date;
}

export type UpdateClienteData = Partial<CreateClienteData> & { activo?: boolean };
