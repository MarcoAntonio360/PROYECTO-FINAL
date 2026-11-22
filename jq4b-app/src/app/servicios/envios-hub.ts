import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { CONFIG } from '../configuracion';
import { Envio } from '../modelos/envio';

@Injectable({
  providedIn: 'root'
})
export class EnviosHub {
  estadoConexion = signal('Conectando…');
  claseEstado = signal('estado-warn');

  private readonly conexion: signalR.HubConnection;
  private escuchas: ((envio: Envio) => void)[] = [];

  constructor() {
    this.conexion = new signalR.HubConnectionBuilder()
      .withUrl(CONFIG.hubUrl, {
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.conexion.on('RecibirCoordenadas', (informacionEnvioJson: string) => {
      console.info('Mensaje recibido:', informacionEnvioJson);
      const envio: Envio = JSON.parse(informacionEnvioJson);
      this.escuchas.forEach((escucha) => escucha(envio));
    });

    this.conexion.onreconnecting((err) => {
      console.warn('Reconectando...', err);
      this.avisar('Reconectando…', 'estado-warn');
    });

    this.conexion.onreconnected((id) => {
      console.info('Reconectado. ConnectionId:', id);
      this.avisar('Conectado (reconectado)', 'estado-ok');
    });

    this.conexion.onclose((err) => {
      console.error('Conexión cerrada', err);
      this.avisar('Desconectado', 'estado-error');
    });
  }

  private avisar(texto: string, clase: string): void {
    this.estadoConexion.set(texto);
    this.claseEstado.set(clase);
  }

  async iniciar(): Promise<boolean> {
    if (this.conexion.state === signalR.HubConnectionState.Connected) {
      return true;
    }
    try {
      await this.conexion.start();
      console.info('SignalR conectado. ConnectionId:', this.conexion.connectionId);
      this.avisar('Conectado (WebSockets)', 'estado-ok');
      return true;
    } catch (err) {
      console.error('No se pudo conectar al hub:', err);
      this.avisar('Sin conexión al servidor', 'estado-error');
      return false;
    }
  }

  async enviarEnvio(envio: Envio): Promise<void> {
    if (this.conexion.state !== signalR.HubConnectionState.Connected) {
      throw new Error('No hay conexión con el servidor.');
    }
    await this.conexion.invoke('EnviarCoordenadas', JSON.stringify(envio));
    console.info('Mensaje enviado:', envio);
  }

  alRecibirEnvio(escucha: (envio: Envio) => void): void {
    this.escuchas.push(escucha);
  }

  limpiarEscuchas(): void {
    this.escuchas = [];
  }
}
