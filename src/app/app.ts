import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Line } from '@antv/g2plot';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { VentaService } from './service/venta.service';
import { IndicadorMensual } from './models/venta.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    CommonModule, 
    FormsModule,        
    NzSelectModule, 
    NzButtonModule, 
    NzCardModule, 
    NzSpinModule,   
    NzIconModule, 
    NzEmptyModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  

  indicadoresMes: IndicadorMensual[] = []; 
  productosConfig: any = {};               
  categorias: string[] = [];               
  marcasForm: string[] = [];               
  todasLasMarcas: string[] = [];


  catSeleccionada = ''; 
  marcasComparacion: string[] = []; 
  chart: any | null = null;
  marcaEdicion: string | null = null; 
  
  isSaving = false;
  isDashboardLoading = false;

  constructor(
    private ventaService: VentaService, 
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.cargarConfiguracion();
  }

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
  }

  cargarConfiguracion() {
    this.isDashboardLoading = true;
    this.ventaService.getProductosConfig().subscribe({
      next: (config) => {
        this.productosConfig = config;
        this.categorias = Object.keys(config);
        

        this.todasLasMarcas = Object.values(this.productosConfig).flat() as string[];


        this.marcasComparacion = [...this.todasLasMarcas];

        this.actualizarGrafico();


        if(this.categorias.length > 0) {
          this.catSeleccionada = this.categorias[0];
          this.actualizarListaMarcasEdicion();
        }
        this.isDashboardLoading = false;
      },
      error: () => {
        this.message.error('Error cargando configuración');
        this.isDashboardLoading = false;
      }
    });
  }

  actualizarListaMarcasEdicion() {
    this.marcasForm = this.productosConfig[this.catSeleccionada] || [];
    this.marcaEdicion = null;    
    this.indicadoresMes = [];    
  }


  actualizarGrafico() {
    const anio = new Date().getFullYear();
    
    this.ventaService.getComparativa(anio, 'Todas', this.marcasComparacion)
      .subscribe(data => {
        

        const mapaMeses: any = {
          '01': 'ene', '02': 'feb', '03': 'mar', '04': 'abr', '05': 'may', '06': 'jun',
          '07': 'jul', '08': 'ago', '09': 'sept', '10': 'oct', '11': 'nov', '12': 'dic'
        };

        const dataCorregida = data.map(d => ({
          ...d,
          mes: mapaMeses[d.mes] || d.mes 
        }));
        

        this.renderLineChart(dataCorregida);
      });
  }

  renderLineChart(data: any[]) {
    if (this.chart) this.chart.destroy();
    
    const container = document.getElementById('container-grafico');
    if (!container) return;

    this.chart = new Line(container, {
      data,
      xField: 'mes',
      yField: 'real',
      seriesField: 'marca', 
      
     
      meta: {
        mes: {
          type: 'cat',
          values: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
        }
      },

      xAxis: {
        title: { text: 'Meses', style: { fill: '#aaa' } },
        label: { autoRotate: false }
      },
      yAxis: { 
        title: { text: 'Ventas (S/.)' },
        grid: { line: { style: { lineDash: [4, 4] } } }
      },
      
      
      legend: {
        position: 'top-left',
        itemName: { style: { fontSize: 13, fontWeight: 600 } },
        marker: { symbol: 'circle' }
      },

      smooth: true,
      point: { size: 3, shape: 'circle' },
    
      tooltip: { 
        showMarkers: false 
      },
      
      animation: { appear: { animation: 'wave-in', duration: 1000 } }
    });
    
    this.chart.render();
  }


  cargarDatosTabla() {
    if (!this.marcaEdicion) return;
    this.isDashboardLoading = true;
    const anio = new Date().getFullYear();
    
    this.ventaService.getIndicadoresMensuales(anio, this.catSeleccionada, this.marcaEdicion)
      .subscribe({
        next: (data) => {
          this.indicadoresMes = data;
          this.isDashboardLoading = false;
        },
        error: () => {
          this.message.error('Error al cargar datos');
          this.isDashboardLoading = false;
        }
      });
  }

  guardarTodo() {
    if (!this.marcaEdicion || this.indicadoresMes.length === 0) return;
    
    this.isSaving = true;
    const anio = new Date().getFullYear();

    const payload = this.indicadoresMes.map(item => ({
      anio,
      mes: item.id, 
      marca: this.marcaEdicion,
      categoria: this.catSeleccionada,
      real: item.real,
      meta: item.meta
    }));

    this.ventaService.guardarPlanificacion(payload).subscribe({
      next: () => {
        this.message.success('¡Guardado Correctamente!');
        this.isSaving = false;
        this.actualizarGrafico(); 
      },
      error: () => {
        this.message.error('Error al guardar');
        this.isSaving = false;
      }
    });
  }
}