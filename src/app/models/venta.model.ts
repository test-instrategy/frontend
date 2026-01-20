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

export interface DashboardStats {
  totalVentas: number;
  totalTransacciones: number;
  promedioVentas: number;
}


export interface IndicadorMensual {
  id: string;
  mes: string;
  real: number;
  meta: number;
  variacion: number;
  score: number;
  order?: number;
}