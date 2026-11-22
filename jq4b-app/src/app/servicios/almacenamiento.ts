import { Injectable } from '@angular/core';
import { CONFIG } from '../configuracion';
import { Usuario } from '../modelos/usuario';
import { ItemCarrito } from '../modelos/item-carrito';
import { FormularioEnvio } from '../modelos/formulario-envio';

@Injectable({
  providedIn: 'root'
})
export class Almacenamiento {
  guardarSesion(usuario: Usuario): void {
    const vence = new Date();
    vence.setDate(vence.getDate() + 1);
    const valor = encodeURIComponent(JSON.stringify(usuario));
    document.cookie = CONFIG.claveSesion + '=' + valor + '; expires=' + vence.toUTCString() + '; path=/; SameSite=Strict';
  }

  leerSesion(): Usuario | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const partes = cookie.split('=');
      if (partes[0] === CONFIG.claveSesion) {
        try {
          return JSON.parse(decodeURIComponent(partes[1]));
        } catch (err) {
          console.error('Cookie de sesión dañada:', err);
          return null;
        }
      }
    }
    return null;
  }

  borrarSesion(): void {
    document.cookie = CONFIG.claveSesion + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict';
  }

  guardarCarrito(items: ItemCarrito[]): void {
    localStorage.setItem(CONFIG.claveCarrito, JSON.stringify(items));
  }

  leerCarrito(): ItemCarrito[] {
    try {
      const crudo = localStorage.getItem(CONFIG.claveCarrito);
      const lista = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(lista)
        ? lista.filter((i) => i && Number.isInteger(i.idProducto) && i.cantidad > 0)
        : [];
    } catch (err) {
      console.error('Carrito dañado, se reinicia:', err);
      localStorage.removeItem(CONFIG.claveCarrito);
      return [];
    }
  }

  vaciarCarrito(): void {
    localStorage.removeItem(CONFIG.claveCarrito);
  }

  guardarFormularioEnvio(formulario: FormularioEnvio): void {
    sessionStorage.setItem(CONFIG.claveFormularioEnvio, JSON.stringify(formulario));
  }

  leerFormularioEnvio(): FormularioEnvio | null {
    try {
      const crudo = sessionStorage.getItem(CONFIG.claveFormularioEnvio);
      return crudo ? JSON.parse(crudo) : null;
    } catch (err) {
      console.error('Formulario de envío dañado:', err);
      sessionStorage.removeItem(CONFIG.claveFormularioEnvio);
      return null;
    }
  }

  borrarFormularioEnvio(): void {
    sessionStorage.removeItem(CONFIG.claveFormularioEnvio);
  }
}
