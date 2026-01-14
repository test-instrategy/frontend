export interface Venta {
  id?: string;
  categoria: 'Gaseosas' | 'Aguas' | string;
  marca: string;
  monto: number;
}

export interface FiltroVenta {
  categoria: string;
  marca: string;
}