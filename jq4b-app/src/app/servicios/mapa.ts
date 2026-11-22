import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { CONFIG } from '../configuracion';

@Injectable({
  providedIn: 'root'
})
export class Mapa {
  crearMapa(idContenedor: string): L.Map {
    const mapa = L.map(idContenedor).setView(CONFIG.centroMapa, CONFIG.zoomInicial);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    return mapa;
  }

  obtenerUbicacion(): Promise<[number, number]> {
    return new Promise((resolver, rechazar) => {
      if (!('geolocation' in navigator)) {
        rechazar(new Error('Tu navegador no soporta geolocalización.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolver([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) rechazar(new Error('Permiso de ubicación denegado.'));
          else if (err.code === err.POSITION_UNAVAILABLE) rechazar(new Error('Ubicación no disponible.'));
          else if (err.code === err.TIMEOUT) rechazar(new Error('Se agotó el tiempo de espera.'));
          else rechazar(new Error('Error de geolocalización.'));
        },
        { timeout: 20000 }
      );
    });
  }

  textoCoordenadas(lat: number, lng: number): string {
    return lat.toFixed(6) + ', ' + lng.toFixed(6);
  }

  parsearCoordenadas(texto: string): [number, number] {
    const partes = texto.split(',').map(Number);
    return [partes[0], partes[1]];
  }

  nombrePunto(indice: number, total: number): string {
    if (indice === 0) return 'Origen';
    if (indice === total - 1) return 'Destino';
    return 'Punto ' + indice;
  }

  construirRuta(latDestino: number, lngDestino: number): string[] {
    const origen = CONFIG.ubicacionTienda;
    const medioLat = (origen[0] + latDestino) / 2;
    const medioLng = (origen[1] + lngDestino) / 2;
    return [
      this.textoCoordenadas(origen[0], origen[1]),
      this.textoCoordenadas(medioLat, medioLng),
      this.textoCoordenadas(latDestino, lngDestino)
    ];
  }
}
