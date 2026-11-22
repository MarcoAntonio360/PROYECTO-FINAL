import { Routes } from '@angular/router';
import { Inicio } from './vistas/inicio/inicio';
import { Login } from './vistas/login/login';
import { RegistroUsuario } from './vistas/registro-usuario/registro-usuario';
import { Catalogo } from './vistas/catalogo/catalogo';
import { DetalleProducto } from './vistas/detalle-producto/detalle-producto';
import { Carrito } from './vistas/carrito/carrito';
import { Checkout } from './vistas/checkout/checkout';
import { MisPedidos } from './vistas/mis-pedidos/mis-pedidos';
import { AdminProductos } from './vistas/admin-productos/admin-productos';
import { AdminPedidos } from './vistas/admin-pedidos/admin-pedidos';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: RegistroUsuario },
  { path: 'catalogo', component: Catalogo },
  { path: 'producto/:id', component: DetalleProducto },
  { path: 'carrito', component: Carrito },
  { path: 'checkout', component: Checkout },
  { path: 'mis-pedidos', component: MisPedidos },
  { path: 'admin/productos', component: AdminProductos },
  { path: 'admin/pedidos', component: AdminPedidos },
  { path: '**', redirectTo: 'inicio' }
];
