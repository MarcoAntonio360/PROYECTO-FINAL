import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Usuarios } from '../../servicios/usuarios';

@Component({
  selector: 'app-registro-usuario',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro-usuario.html',
  styleUrl: './registro-usuario.css',
})
export class RegistroUsuario {
  private readonly usuarios = inject(Usuarios);

  nombre = signal('');
  correo = signal('');
  contrasena = signal('');
  confirmacion = signal('');
  telefono = signal('');
  direccion = signal('');
  mensaje = signal('');
  exito = signal(false);
  cargando = signal(false);

  async registrar(): Promise<void> {
    const nombre = this.nombre().trim();
    const correo = this.correo().trim();
    const contrasena = this.contrasena();
    const telefono = this.telefono().trim();
    const direccion = this.direccion().trim();

    this.exito.set(false);

    if (!nombre || !correo || !contrasena) {
      this.mensaje.set('Nombre, correo y contraseña son obligatorios.');
      return;
    }

    if (!correo.includes('@')) {
      this.mensaje.set('Escriba un correo válido.');
      return;
    }

    if (contrasena.length < 6) {
      this.mensaje.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (contrasena !== this.confirmacion()) {
      this.mensaje.set('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');

    try {
      await this.usuarios.registrar({
        nombre: nombre,
        correo: correo,
        contrasena: contrasena,
        telefono: telefono || null,
        direccion: direccion || null
      });
      this.exito.set(true);
      this.mensaje.set('Cuenta creada correctamente. Ya puede iniciar sesión.');
      this.nombre.set('');
      this.correo.set('');
      this.contrasena.set('');
      this.confirmacion.set('');
      this.telefono.set('');
      this.direccion.set('');
    } catch (err) {
      const error = err as Error;
      this.mensaje.set(error.message);
    } finally {
      this.cargando.set(false);
    }
  }
}