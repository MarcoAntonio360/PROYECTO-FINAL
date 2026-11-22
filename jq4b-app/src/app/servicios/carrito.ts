import { Injectable, inject, signal } from '@angular/core';
import { Almacenamiento } from './almacenamiento';
import { ItemCarrito } from '../modelos/item-carrito';
import { Producto } from '../modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class CarritoCompras {
  private readonly almacenamiento = inject(Almacenamiento);

  items = signal<ItemCarrito[]>(this.almacenamiento.leerCarrito());

  agregar(producto: Producto, cantidad: number): void {
    const existente = this.items().find((i) => i.idProducto === producto.id);

    if (existente) {
      this.items.update((elementos) =>
        elementos.map((i) =>
          i.idProducto === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      );
    } else {
      const nuevo: ItemCarrito = {
        idProducto: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: cantidad
      };
      this.items.update((elementos) => [...elementos, nuevo]);
    }

    this.almacenamiento.guardarCarrito(this.items());
  }

  cambiarCantidad(idProducto: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitar(idProducto);
      return;
    }
    this.items.update((elementos) =>
      elementos.map((i) => (i.idProducto === idProducto ? { ...i, cantidad: cantidad } : i))
    );
    this.almacenamiento.guardarCarrito(this.items());
  }

  quitar(idProducto: number): void {
    this.items.update((elementos) => elementos.filter((i) => i.idProducto !== idProducto));
    this.almacenamiento.guardarCarrito(this.items());
  }

  vaciar(): void {
    this.items.set([]);
    this.almacenamiento.vaciarCarrito();
  }

  total(): number {
    return this.items().reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  }

  cantidadTotal(): number {
    return this.items().reduce((suma, i) => suma + i.cantidad, 0);
  }
}
