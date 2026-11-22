import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Productos } from '../../servicios/productos';
import { Categorias } from '../../servicios/categorias';
import { CarritoCompras } from '../../servicios/carrito';
import { Producto } from '../../modelos/producto';

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  productos = inject(Productos);
  categorias = inject(Categorias);
  private readonly carrito = inject(CarritoCompras);

  idCategoria = signal(0);
  cargando = signal(false);
  error = signal('');
  aviso = signal('');

  async ngOnInit(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');

    try {
      await this.categorias.cargar();
      await this.productos.cargar();
    } catch (err) {
      const fallo = err as Error;
      this.error.set(fallo.message);
    } finally {
      this.cargando.set(false);
    }
  }

  async cambiarCategoria(idCategoria: number): Promise<void> {
    this.idCategoria.set(idCategoria);
    this.cargando.set(true);
    this.error.set('');
    this.aviso.set('');

    try {
      await this.productos.cargar(idCategoria);
    } catch (err) {
      const fallo = err as Error;
      this.error.set(fallo.message);
    } finally {
      this.cargando.set(false);
    }
  }

  agregar(producto: Producto): void {
    this.carrito.agregar(producto, 1);
    this.aviso.set(producto.nombre + ' se agregó al carrito.');
  }
}