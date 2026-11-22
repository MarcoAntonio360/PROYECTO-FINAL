import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Usuarios } from '../../servicios/usuarios';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly usuarios = inject(Usuarios);
  private readonly router = inject(Router);

  correo = signal('');
  contrasena = signal('');
  mensaje = signal('');
  cargando = signal(false);

  async entrar(): Promise<void> {
    const correo = this.correo().trim();
    const contrasena = this.contrasena();

    if (!correo || !contrasena) {
      this.mensaje.set('Escriba su correo y su contraseña.');
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');

    try {
      const usuario = await this.usuarios.iniciarSesion(correo, contrasena);
      if (usuario.rol === 'administrador') {
        this.router.navigate(['/admin/pedidos']);
      } else {
        this.router.navigate(['/catalogo']);
      }
    } catch (err) {
      const error = err as Error;
      this.mensaje.set(error.message);
    } finally {
      this.cargando.set(false);
    }
  }
}