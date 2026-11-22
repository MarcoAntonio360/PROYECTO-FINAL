import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api';
import { Pedido, NuevoPedido } from '../modelos/pedido';

@Injectable({
  providedIn: 'root'
})
export class Pedidos {
  private readonly api = inject(Api);

  pedidos = signal<Pedido[]>([]);

  async cargarTodos(): Promise<void> {
    const lista = await this.api.obtener<Pedido[]>('/api/pedidos');
    this.pedidos.set(lista);
  }

  async cargarDeUsuario(idUsuario: number): Promise<void> {
    const lista = await this.api.obtener<Pedido[]>('/api/pedidos/usuario/' + idUsuario);
    this.pedidos.set(lista);
  }

  async crear(nuevo: NuevoPedido): Promise<Pedido> {
    return await this.api.enviar<Pedido>('/api/pedidos', 'POST', nuevo);
  }

  async actualizarUbicacion(id: number, indiceActual: number): Promise<Pedido> {
    const pedido = await this.api.enviar<Pedido>('/api/pedidos/' + id + '/ubicacion', 'PUT', {
      indiceActual: indiceActual
    });
    this.pedidos.update((lista) => lista.map((p) => (p.id === pedido.id ? pedido : p)));
    return pedido;
  }
}
