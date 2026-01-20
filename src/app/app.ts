import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Column } from '@antv/g2plot';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { VentaService } from './service/venta.service';
import { Venta, DashboardStats, IndicadorMensual } from './models/venta.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    CommonModule, 
    FormsModule,         
    ReactiveFormsModule,  
    NzSelectModule, 
    NzButtonModule, 
    NzInputNumberModule, 
    NzCardModule, 
    NzSkeletonModule,
    NzSpinModule,   
    NzIconModule, 
    NzEmptyModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  

  ventasRaw: Venta[] = [];
  indicadoresMes: IndicadorMensual[] = [];
  stats: DashboardStats = { totalVentas: 0, totalTransacciones: 0, promedioVentas: 0 };
  

  productosConfig: Record<string, string[]> = {};
  categorias: string[] = [];
  

  ventaForm!: FormGroup;
  marcasForm: string[] = [];
  

  catSeleccionada = 'Todas';
  marcaSeleccionada = 'Todas';
  marcasFiltro: string[] = []; 


  isConfigLoading = true;
  isDashboardLoading = false; 
  isSaving = false;


  chart: Column | null = null;

  constructor(
    private ventaService: VentaService, 
    private message: NzMessageService,
    private fb: FormBuilder 
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.cargarConfiguracion();
    this.cargarDashboardCompleto();
  }


  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }


  private initForm() {
    this.ventaForm = this.fb.group({
      categoria: [null, [Validators.required]],
      marca: [{ value: null, disabled: true }, [Validators.required]],
      monto: [0, [Validators.required, Validators.min(0.1)]] 
    });
  }

  cargarConfiguracion() {
    this.isConfigLoading = true;
    this.ventaService.getProductosConfig()
      .pipe(finalize(() => this.isConfigLoading = false))
      .subscribe({
        next: (config) => {
          this.productosConfig = config;
          this.categorias = Object.keys(config);
        },
        error: () => this.message.error('Error cargando configuración de productos')
      });
  }



  cargarDashboardCompleto() {
    this.isDashboardLoading = true;
    const anio = new Date().getFullYear();

    forkJoin({
      ventas: this.ventaService.getVentas(),
      stats: this.ventaService.getStats(),
      indicadores: this.ventaService.getIndicadoresMensuales(anio)
    })
    .pipe(finalize(() => this.isDashboardLoading = false))
    .subscribe({
      next: (res) => {

        this.ventasRaw = res.ventas;
        this.stats = res.stats;
        this.indicadoresMes = res.indicadores;

        this.renderChart(res.ventas);
      },
      error: () => this.message.error('Error al cargar el dashboard')
    });
  }

  aplicarFiltros() {
    this.isDashboardLoading = true; 
    const filtros = { categoria: this.catSeleccionada, marca: this.marcaSeleccionada };


    forkJoin({
      ventas: this.ventaService.getVentas(filtros),
      stats: this.ventaService.getStats(filtros)
    })
    .pipe(finalize(() => this.isDashboardLoading = false))
    .subscribe({
      next: (res) => {
        this.ventasRaw = res.ventas;
        this.stats = res.stats;
        this.renderChart(res.ventas);
      },
      error: () => this.message.error('Error filtrando datos')
    });
  }



  onCategoriaFormChange(cat: string) {
    this.marcasForm = this.productosConfig[cat] || [];

    const marcaControl = this.ventaForm.get('marca');
    marcaControl?.enable();
    marcaControl?.setValue(null);
  }

  guardar() {

    if (this.ventaForm.invalid) {

      Object.values(this.ventaForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.warning('Complete el formulario correctamente');
      return;
    }

    this.isSaving = true;
    const ventaData: Venta = this.ventaForm.value;

    this.ventaService.guardarVenta(ventaData)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.message.success('Venta registrada correctamente');
          
          this.ventaForm.reset({ monto: 0 });
          this.ventaForm.get('marca')?.disable();
          
          this.aplicarFiltros(); 
          this.recargarIndicadoresOnly(); 
        },
        error: () => this.message.error('Error al guardar venta')
      });
  }


  onCategoriaFilterChange(cat: string) {
    this.marcasFiltro = this.productosConfig[cat] || [];
    this.marcaSeleccionada = 'Todas';
    this.aplicarFiltros();
  }


  recargarIndicadoresOnly() {
    const anio = new Date().getFullYear();
    this.ventaService.getIndicadoresMensuales(anio).subscribe(data => this.indicadoresMes = data);
  }

  onMetaChange(item: IndicadorMensual) {
    if (item.meta < 0) return;

    this.ventaService.actualizarMetaMensual(item.id, item.meta).subscribe({
      next: () => {
        this.message.success(`Meta actualizada`);
        this.recargarIndicadoresOnly(); 
      },
      error: () => this.message.error('Error al guardar meta')
    });
  }



  renderChart(data: Venta[]) {
    if (!data || data.length === 0) {
      if (this.chart) {
        this.chart.changeData([]);
      }
      return;
    }

    if (!this.chart) {
      const container = document.getElementById('container-grafico');
      if(!container) return; 

      this.chart = new Column(container, {
        data,
        xField: 'marca',
        yField: 'monto',
        seriesField: 'categoria',
        isGroup: true,
        color: ['#1890ff', '#f5222d'],
        label: {
          position: 'middle',
          
          content: (item) => `S/. ${item['monto']}`, 
          style: { fill: '#FFFFFF', opacity: 0.6 },
        },
        animation: {
          appear: { animation: 'scale-in-y', duration: 1000 },
        },
      });
      this.chart.render();
    } else {
      this.chart.changeData(data);
    }
  }
}