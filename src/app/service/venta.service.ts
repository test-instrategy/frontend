import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DashboardStats, FiltroVenta, IndicadorMensual, Venta } from '../models/venta.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private readonly URL = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}


  getVentas(filtros?: FiltroVenta): Observable<Venta[]> {
    const params = new HttpParams({ fromObject: filtros as any });
    return this.http.get<Venta[]>(this.URL, { params });
  }


  guardarVenta(venta: Venta): Observable<any> {
    return this.http.post(this.URL, venta);
  }


  getProductosConfig(): Observable<Record<string, string[]>> {
    return this.http.get<Record<string, string[]>>(`${this.URL}/config/productos`);
  }

  
  getStats(filtros?: FiltroVenta): Observable<DashboardStats> {
    const params = new HttpParams({ fromObject: filtros as any });
    return this.http.get<DashboardStats>(`${this.URL}/stats`, { params });
  }


  getIndicadoresMensuales(anio: number): Observable<IndicadorMensual[]> {
    const params = new HttpParams().set('anio', anio.toString());
    return this.http.get<IndicadorMensual[]>(`${this.URL}/indicadores-mes`, { params });
  }

  
  actualizarMetaMensual(id: string, valor: number) {
    return this.http.post(`${this.URL}/meta-mes`, { id, valor });
  }
}
