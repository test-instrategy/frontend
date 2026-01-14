import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FiltroVenta, Venta } from '../models/venta.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private readonly URL = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}


  getVentas(filtros?: FiltroVenta): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.URL, { params: filtros as any });
  }


  guardarVenta(venta: Venta): Observable<any> {
    return this.http.post(this.URL, venta);
  }


  getProductosConfig(): Observable<Record<string, string[]>> {
    return this.http.get<Record<string, string[]>>(`${environment.apiUrl}/config/productos`);
  }

  
  getStats(filtros?: FiltroVenta): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/ventas/stats`, { params: filtros as any });
  }
}
