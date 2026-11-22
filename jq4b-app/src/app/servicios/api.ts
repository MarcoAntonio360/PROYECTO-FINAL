import { Injectable } from '@angular/core';
import { CONFIG } from '../configuracion';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private async llamar(ruta: string, opciones: RequestInit): Promise<Response> {
    let respuesta: Response;

    try {
      respuesta = await fetch(CONFIG.apiUrl + ruta, opciones);
    } catch (err) {
      console.error('No se pudo llegar al servidor:', err);
      throw new Error('No hay conexión con el servidor.');
    }

    if (!respuesta.ok) {
      let mensaje = 'Error del servidor (' + respuesta.status + ').';
      try {
        const datos = await respuesta.json();
        if (datos.mensaje) mensaje = datos.mensaje;
        else if (datos.title) mensaje = datos.title;
      } catch (err) {
        console.error('La respuesta de error no traía mensaje:', err);
      }
      throw new Error(mensaje);
    }

    return respuesta;
  }

  async obtener<T>(ruta: string): Promise<T> {
    const respuesta = await this.llamar(ruta, { method: 'GET' });
    return await respuesta.json();
  }

  async enviar<T>(ruta: string, metodo: string, cuerpo: object): Promise<T> {
    const respuesta = await this.llamar(ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    });
    return await respuesta.json();
  }

  async eliminar(ruta: string): Promise<void> {
    await this.llamar(ruta, { method: 'DELETE' });
  }
}
