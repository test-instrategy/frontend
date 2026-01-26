import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IndicadorMensual, ProductosConfig } from '../models/venta.model'; 
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly URL = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  getIndicadoresMensuales(anio: number, categoria?: string, marca?: string): Observable<IndicadorMensual[]> {
    let params = new HttpParams().set('anio', anio.toString());
    if (categoria && categoria !== 'Todas') params = params.set('categoria', categoria);
    if (marca && marca !== 'Todas') params = params.set('marca', marca);
    return this.http.get<IndicadorMensual[]>(`${this.URL}/indicadores-mes`, { params });
  }

  getProductosConfig(): Observable<ProductosConfig> {
  return this.http.get<ProductosConfig>(`${this.URL}/config/productos`);
}

  guardarPlanificacion(datos: any[]) {
    return this.http.post(`${this.URL}/planificacion`, datos);
  }

  getComparativa(anio: number, categoria: string, marcas: string[]) {
    return this.http.post<any[]>(`${this.URL}/comparativa`, { anio, categoria, marcas });
  }
}