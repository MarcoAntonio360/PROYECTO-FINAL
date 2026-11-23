import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Productos } from '../../servicios/productos';
import { Categorias } from '../../servicios/categorias';
import { TablaProductos } from '../../componentes/tabla-productos/tabla-productos';
import { Producto, ProductoNuevo } from '../../modelos/producto';

@Component({
  selector: 'app-admin-productos',
  imports: [FormsModule, TablaProductos],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css',
})
export class AdminProductos implements OnInit {
  productos = inject(Productos);
  categorias = inject(Categorias);

  idEditando = signal(0);
  nombre = signal('');
  descripcion = signal('');
  precio = signal<number | null>(null);
  existencia = signal<number | null>(null);
  imagen = signal('');
  idCategoria = signal(0);

  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  mensaje = signal('');
  exito = signal(false);

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

  editar(producto: Producto): void {
    this.idEditando.set(producto.id);
    this.nombre.set(producto.nombre);
    this.descripcion.set(producto.descripcion || '');
    this.precio.set(producto.precio);
    this.existencia.set(producto.existencia);
    this.imagen.set(producto.imagen || '');
    this.idCategoria.set(producto.idCategoria);
    this.mensaje.set('');
    window.scrollTo(0, 0);
  }

    async eliminar(producto: Producto): Promise<void> {
    const seguro = confirm('¿Eliminar el producto "' + producto.nombre + '"?');
    if (!seguro) return;

    this.exito.set(false);
    this.mensaje.set('');

    try {
      await this.productos.eliminar(producto.id);
      if (this.idEditando() === producto.id) this.limpiar();
      this.exito.set(true);
      this.mensaje.set('Producto eliminado correctamente.');
    } catch (err) {
      const fallo = err as Error;
      this.mensaje.set(fallo.message);
    }

    window.scrollTo(0, 0);
  }

  cancelar(): void {
    this.limpiar();
    this.mensaje.set('');
  }

  async guardar(): Promise<void> {
    const nombre = this.nombre().trim();
    const descripcion = this.descripcion().trim();
    const precio = this.precio();
    const existencia = this.existencia();
    const imagen = this.imagen().trim();
    const idCategoria = this.idCategoria();

    this.exito.set(false);

    if (!nombre) {
      this.mensaje.set('El nombre es obligatorio.');
      return;
    }

    if (precio === null || precio <= 0) {
      this.mensaje.set('El precio debe ser mayor que cero.');
      return;
    }

    if (existencia === null || existencia < 0 || !Number.isInteger(existencia)) {
      this.mensaje.set('La existencia debe ser un número entero de cero en adelante.');
      return;
    }

    if (!idCategoria) {
      this.mensaje.set('Seleccione una categoría.');
      return;
    }

    const datos: ProductoNuevo = {
      nombre: nombre,
      descripcion: descripcion || null,
      precio: precio,
      existencia: existencia,
      imagen: imagen || null,
      idCategoria: idCategoria
    };

    this.guardando.set(true);
    this.mensaje.set('');

    try {
      if (this.idEditando()) {
        await this.productos.actualizar(this.idEditando(), datos);
        this.mensaje.set('Producto actualizado correctamente.');
      } else {
        await this.productos.crear(datos);
        this.mensaje.set('Producto creado correctamente.');
      }
      this.exito.set(true);
      this.limpiar();
    } catch (err) {
      const fallo = err as Error;
      this.mensaje.set(fallo.message);
    } finally {
      this.guardando.set(false);
    }
  }

  limpiar(): void {
    this.idEditando.set(0);
    this.nombre.set('');
    this.descripcion.set('');
    this.precio.set(null);
    this.existencia.set(null);
    this.imagen.set('');
    this.idCategoria.set(0);
  }
}