import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Productos } from '../../servicios/productos';
import { Usuarios } from '../../servicios/usuarios';
import { Producto } from '../../modelos/producto';

@Component({
  selector: 'app-inicio',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  productos = inject(Productos);
  usuarios = inject(Usuarios);

  error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      await this.productos.cargar();
    } catch (err) {
      const fallo = err as Error;
      this.error.set(fallo.message);
    }
  }

  destacados(): Producto[] {
    return this.productos.productos().slice(0, 4);
  }
}