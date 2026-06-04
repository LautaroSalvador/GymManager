export interface Pago {
  id: number;
  clienteId: number;
  fechaPago: string; // ISO date string
  monto: number;
  periodoMes: number;
  periodoAnio: number;
  medioPago: string | null;
  createdAt: string;
}
