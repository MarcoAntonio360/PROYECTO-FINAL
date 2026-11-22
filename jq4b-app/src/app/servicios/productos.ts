import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api';
import { Producto, ProductoNuevo } from '../modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class Productos {
  private readonly api = inject(Api);

  productos = signal<Producto[]>([]);

  async cargar(idCategoria?: number): Promise<void> {
    let ruta = '/api/productos';
    if (idCategoria) ruta = ruta + '?idCategoria=' + idCategoria;
    const lista = await this.api.obtener<Producto[]>(ruta);
    this.productos.set(lista);
  }

  async obtenerPorId(id: number): Promise<Producto> {
    return await this.api.obtener<Producto>('/api/productos/' + id);
  }

  async crear(datos: ProductoNuevo): Promise<void> {
    await this.api.enviar<Producto>('/api/productos', 'POST', datos);
    await this.cargar();
  }

  async actualizar(id: number, datos: ProductoNuevo): Promise<void> {
    await this.api.enviar<Producto>('/api/productos/' + id, 'PUT', datos);
    await this.cargar();
  }

  async eliminar(id: number): Promise<void> {
    await this.api.eliminar('/api/productos/' + id);
    await this.cargar();
  }
}
