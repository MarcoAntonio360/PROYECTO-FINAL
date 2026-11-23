import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categorias } from '../../servicios/categorias';
import { Productos } from '../../servicios/productos';
import { Categoria, CategoriaNueva } from '../../modelos/categoria';

@Component({
  selector: 'app-gestion-categorias',
  imports: [FormsModule],
  templateUrl: './gestion-categorias.html',
  styleUrl: './gestion-categorias.css',
})
export class GestionCategorias {
  categorias = inject(Categorias);
  private readonly productos = inject(Productos);

  idEditando = signal(0);
  nombre = signal('');
  descripcion = signal('');

  guardando = signal(false);
  mensaje = signal('');
  exito = signal(false);

  editar(categoria: Categoria): void {
    this.idEditando.set(categoria.id);
    this.nombre.set(categoria.nombre);
    this.descripcion.set(categoria.descripcion || '');
    this.mensaje.set('');
  }

  cancelar(): void {
    this.limpiar();
    this.mensaje.set('');
  }

  async guardar(): Promise<void> {
    const nombre = this.nombre().trim();
    const descripcion = this.descripcion().trim();

    this.exito.set(false);

    if (!nombre) {
      this.mensaje.set('El nombre es obligatorio.');
      return;
    }

    if (nombre.length > 50) {
      this.mensaje.set('El nombre no puede pasar de 50 caracteres.');
      return;
    }

    if (descripcion.length > 200) {
      this.mensaje.set('La descripción no puede pasar de 200 caracteres.');
      return;
    }

    const datos: CategoriaNueva = {
      nombre: nombre,
      descripcion: descripcion || null
    };

    this.guardando.set(true);
    this.mensaje.set('');

    try {
      if (this.idEditando()) {
        await this.categorias.actualizar(this.idEditando(), datos);
        await this.productos.cargar();
        this.mensaje.set('Categoría actualizada correctamente.');
      } else {
        await this.categorias.crear(datos);
        this.mensaje.set('Categoría creada correctamente.');
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

  async eliminar(categoria: Categoria): Promise<void> {
    const seguro = confirm('¿Eliminar la categoría "' + categoria.nombre + '"?');
    if (!seguro) return;

    this.exito.set(false);
    this.mensaje.set('');

    try {
      await this.categorias.eliminar(categoria.id);
      if (this.idEditando() === categoria.id) this.limpiar();
      this.exito.set(true);
      this.mensaje.set('Categoría eliminada correctamente.');
    } catch (err) {
      const fallo = err as Error;
      this.mensaje.set(fallo.message);
    }
  }

  limpiar(): void {
    this.idEditando.set(0);
    this.nombre.set('');
    this.descripcion.set('');
  }
}