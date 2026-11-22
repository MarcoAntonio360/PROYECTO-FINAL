import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api';
import { Categoria, CategoriaNueva } from '../modelos/categoria';

@Injectable({
  providedIn: 'root'
})
export class Categorias {
  private readonly api = inject(Api);

  categorias = signal<Categoria[]>([]);

  async cargar(): Promise<void> {
    const lista = await this.api.obtener<Categoria[]>('/api/categorias');
    this.categorias.set(lista);
  }

  async crear(datos: CategoriaNueva): Promise<void> {
    await this.api.enviar<Categoria>('/api/categorias', 'POST', datos);
    await this.cargar();
  }

  async actualizar(id: number, datos: CategoriaNueva): Promise<void> {
    await this.api.enviar<Categoria>('/api/categorias/' + id, 'PUT', datos);
    await this.cargar();
  }

  async eliminar(id: number): Promise<void> {
    await this.api.eliminar('/api/categorias/' + id);
    await this.cargar();
  }
}
