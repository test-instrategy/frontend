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
import { Venta } from './models/venta.model';
import { VentaService } from './service/venta.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, NzSelectModule, NzButtonModule, NzInputNumberModule, NzCardModule, NzSkeletonModule,
    NzSpinModule,   
    NzIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  ventasRaw: Venta[] = [];
  nuevaVenta: Venta = { categoria: '', marca: '', monto: 0 };
  
  marcasForm: string[] = [];
  marcasFiltro: string[] = [];
  
  catSeleccionada = 'Todas';
  marcaSeleccionada = 'Todas';
  chart: any;

  productosConfig: Record<string, string[]> = {};
  categorias: string[] = [];

  isConfigLoading = true;  
  isChartLoading = false;
  isSaving = false;  

  constructor(private ventaService: VentaService, private message: NzMessageService) {}

  ngOnInit() {
    this.cargarConfiguracion();
    this.cargarDatos();
  }


  cargarConfiguracion() {
    this.isConfigLoading = true;
    this.ventaService.getProductosConfig().subscribe({
      next: (config) => {
        this.productosConfig = config;
        this.categorias = Object.keys(config);
        this.isConfigLoading = false;
      },
      error: () => {
        this.message.error('Error al cargar configuración');
        this.isConfigLoading = false;
      }
    });
  }


  cargarDatos() {
    this.isChartLoading = true;
    this.ventaService.getVentas().subscribe({
      next: (data) => {
        this.ventasRaw = data;
        this.renderChart(data);
        this.isChartLoading = false;
      },
      error: () => {
        this.isChartLoading = false;
      }
    });
  }

  onCategoriaChange(cat: string, tipo: 'form' | 'filtro') {
    
    if (tipo === 'form') {
      this.marcasForm = this.productosConfig[cat] || [];
      this.nuevaVenta.marca = '';
    } else {
      this.marcasFiltro = this.productosConfig[cat] || [];
      this.marcaSeleccionada = 'Todas';
      this.aplicarFiltros();
    }
  }

  guardar() {
    this.isSaving = true;
    this.ventaService.guardarVenta(this.nuevaVenta).subscribe({
      next: () => {
        this.cargarDatos();
        this.message.success('Venta registrada');
        this.nuevaVenta = { categoria: '', marca: '', monto: 0 };
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
        this.message.error('Error al guardar');
      }
    });
  }

  aplicarFiltros() {
    this.isChartLoading = true;
    const filtros = { categoria: this.catSeleccionada, marca: this.marcaSeleccionada };
    this.ventaService.getVentas(filtros).subscribe(data => {
      this.chart.changeData(data);
      this.isChartLoading = false;
    });
  }

  renderChart(data: Venta[]) {
  if (!this.chart) {
    this.chart = new Column('container-grafico', {
      data,
      xField: 'marca',
      yField: 'monto',
      seriesField: 'categoria',
      isGroup: true,
      color: ['#1890ff', '#f5222d'],
      
      label: {
        position: 'middle',
        style: {
          fill: '#FFFFFF',
          opacity: 0.6,
        },
      },
      
      animation: {
        appear: {
          animation: 'scale-in-y',
          duration: 1000,
        },
      },
    });
    this.chart.render();
  } else {
    this.chart.changeData(data);
  }
}
}
