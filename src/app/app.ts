import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Column } from '@antv/g2plot';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, NzSelectModule, NzButtonModule, NzInputNumberModule, NzCardModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  ventasRaw: any[] = [];
  nuevaVenta = { categoria: null, marca: null, monto: 0 };
  marcasForm: string[] = [];
  marcasFiltro: string[] = [];
  catSeleccionada = 'Todas';
  marcaSeleccionada = 'Todas';
  chart: any;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.cargarDatos(); }

  cargarDatos() {
    this.http.get<any[]>('http://localhost:3000/api/ventas').subscribe(data => {
      this.ventasRaw = data;
      this.renderChart(data);
    });
  }

  // Lógica de cascada requerida
  onCategoriaChange(cat: any, tipo: 'form' | 'filtro') {
    const opciones: any = {
      'Gaseosas': ['Coca Cola', 'Pepsi'],
      'Aguas': ['San Luis', 'San Mateo']
    };
    if (tipo === 'form') {
      this.marcasForm = opciones[cat] || [];
      this.nuevaVenta.marca = null;
    } else {
      this.marcasFiltro = opciones[cat] || [];
      this.marcaSeleccionada = 'Todas';
      this.aplicarFiltros();
    }
  }

  guardar() {
    this.http.post('http://localhost:3000/api/ventas', this.nuevaVenta).subscribe(() => this.cargarDatos());
  }

  aplicarFiltros() {
    const filtrado = this.ventasRaw.filter(v => 
      (this.catSeleccionada === 'Todas' || v.categoria === this.catSeleccionada) &&
      (this.marcaSeleccionada === 'Todas' || v.marca === this.marcaSeleccionada)
    );
    this.chart.changeData(filtrado);
  }

  renderChart(data: any[]) {
    if (!this.chart) {
      this.chart = new Column('container-grafico', {
        data, xField: 'marca', yField: 'monto', seriesField: 'categoria',
        color: ['#1890ff', '#f5222d']
      });
      this.chart.render();
    } else { this.chart.changeData(data); }
  }
}
