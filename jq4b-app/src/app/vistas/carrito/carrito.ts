import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarritoCompras } from '../../servicios/carrito';
import { Usuarios } from '../../servicios/usuarios';

@Component({
  selector: 'app-carrito',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  carrito = inject(CarritoCompras);
  private readonly usuarios = inject(Usuarios);
  private readonly router = inject(Router);

  aviso = signal('');

  continuar(): void {
    if (!this.usuarios.usuarioActual()) {
      this.aviso.set('Inicie sesión para finalizar su compra.');
      return;
    }
    this.router.navigate(['/checkout']);
  }
}