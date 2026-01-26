
export interface FiltroVenta {
  categoria: string;
  marca: string;
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

export interface ProductosConfig {
  [categoria: string]: string[];
}