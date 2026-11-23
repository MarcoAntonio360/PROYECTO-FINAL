import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '../../modelos/producto';

@Component({
  selector: 'app-tabla-productos',
  imports: [CurrencyPipe],
  templateUrl: './tabla-productos.html',
  styleUrl: './tabla-productos.css',
})
export class TablaProductos {
  productos = input<Producto[]>([]);
  alEditar = output<Producto>();
  alEliminar = output<Producto>();
}