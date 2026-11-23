import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.html',
  styleUrl: './grafica.css',
})
export class Grafica implements OnDestroy {
  tipo = input<'bar' | 'doughnut' | 'line' | 'pie'>('bar');
  titulo = input('');
  nombreDatos = input('Total');
  etiquetas = input<string[]>([]);
  valores = input<number[]>([]);

  private readonly lienzo = viewChild<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico: Chart | null = null;
  private readonly paleta = ['#1f3a5f', '#e07a1f', '#2e8b57', '#c0392b', '#8e44ad', '#16a0b5'];

  constructor() {
    effect(() => {
      const lienzo = this.lienzo();
      const tipo = this.tipo();
      const titulo = this.titulo();
      const nombreDatos = this.nombreDatos();
      const etiquetas = this.etiquetas();
      const valores = this.valores();

      if (!lienzo) return;

      this.destruir();

      this.grafico = new Chart(lienzo.nativeElement, {
        type: tipo,
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: nombreDatos,
              data: valores,
              backgroundColor: tipo === 'line' ? '#1f3a5f' : this.paleta,
              borderColor: '#1f3a5f'
            }
          ]
        },
                options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: titulo },
            legend: { display: tipo === 'pie' || tipo === 'doughnut' }
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destruir();
  }

  private destruir(): void {
    if (this.grafico) {
      this.grafico.destroy();
      this.grafico = null;
    }
  }
}