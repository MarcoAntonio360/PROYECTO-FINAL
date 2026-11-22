import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Productos } from '../../servicios/productos';
import { CarritoCompras } from '../../servicios/carrito';
import { Producto } from '../../modelos/producto';

@Component({
  selector: 'app-detalle-producto',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {
  private readonly productos = inject(Productos);
  private readonly carrito = inject(CarritoCompras);
  private readonly ruta = inject(ActivatedRoute);

  producto = signal<Producto | null>(null);
  cantidad = signal(1);
  cargando = signal(false);
  error = signal('');
  aviso = signal('');

  async ngOnInit(): Promise<void> {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('El producto indicado no es válido.');
      return;
    }

    this.cargando.set(true);

    try {
      const producto = await this.productos.obtenerPorId(id);
      this.producto.set(producto);
    } catch (err) {
      const fallo = err as Error;
      this.error.set(fallo.message);
    } finally {
      this.cargando.set(false);
    }
  }

  agregar(): void {
    const producto = this.producto();
    if (!producto) return;

    this.error.set('');
    this.aviso.set('');

    const cantidad = Number(this.cantidad());
    const enCarrito = this.carrito.items().find((i) => i.idProducto === producto.id);
    const yaAgregado = enCarrito ? enCarrito.cantidad : 0;

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      this.error.set('Escriba una cantidad válida.');
      return;
    }

    if (yaAgregado + cantidad > producto.existencia) {
      this.error.set(
        'Solo hay ' + producto.existencia + ' disponibles y ya tiene ' + yaAgregado + ' en el carrito.'
      );
      return;
    }

    this.carrito.agregar(producto, cantidad);
    this.aviso.set('Se agregaron ' + cantidad + ' unidad(es) al carrito.');
    this.cantidad.set(1);
  }
}