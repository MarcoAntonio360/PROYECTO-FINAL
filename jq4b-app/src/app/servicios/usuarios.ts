import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api';
import { Almacenamiento } from './almacenamiento';
import { Usuario, RegistroUsuario } from '../modelos/usuario';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {
  private readonly api = inject(Api);
  private readonly almacenamiento = inject(Almacenamiento);

  usuarioActual = signal<Usuario | null>(this.almacenamiento.leerSesion());

  async iniciarSesion(correo: string, contrasena: string): Promise<Usuario> {
    const usuario = await this.api.enviar<Usuario>('/api/usuarios/login', 'POST', {
      correo: correo,
      contrasena: contrasena
    });
    this.almacenamiento.guardarSesion(usuario);
    this.usuarioActual.set(usuario);
    return usuario;
  }

  async registrar(datos: RegistroUsuario): Promise<Usuario> {
    return await this.api.enviar<Usuario>('/api/usuarios/registro', 'POST', datos);
  }

  cerrarSesion(): void {
    this.almacenamiento.borrarSesion();
    this.usuarioActual.set(null);
  }

  esAdministrador(): boolean {
    const usuario = this.usuarioActual();
    return usuario !== null && usuario.rol === 'administrador';
  }
}
