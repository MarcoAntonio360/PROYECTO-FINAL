import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Usuarios } from '../../servicios/usuarios';
import { CarritoCompras } from '../../servicios/carrito';

@Component({
  selector: 'app-barra-navegacion',
  imports: [RouterLink],
  templateUrl: './barra-navegacion.html',
  styleUrl: './barra-navegacion.css',
})
export class BarraNavegacion {
  usuarios = inject(Usuarios);
  carrito = inject(CarritoCompras);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.usuarios.cerrarSesion();
    this.router.navigate(['/inicio']);
  }
}
