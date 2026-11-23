import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import * as L from 'leaflet';
import { Pedidos } from '../../servicios/pedidos';
import { Mapa } from '../../servicios/mapa';
import { EnviosHub } from '../../servicios/envios-hub';
import { Pedido } from '../../modelos/pedido';

@Component({
  selector: 'app-admin-pedidos',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.css',
})
export class AdminPedidos implements OnInit, AfterViewInit, OnDestroy {
  pedidos = inject(Pedidos);
  hub = inject(EnviosHub);
  private readonly mapa = inject(Mapa);

  cargando = signal(false);
  error = signal('');
  pedidoSeleccionado = signal<Pedido | null>(null);
  moviendo = signal(false);
  mensaje = signal('');
  exito = signal(false);

  private mapaLeaflet: L.Map | null = null;
  private capa: L.LayerGroup | null = null;
  private readonly ultimoPunto = 2;

  async ngOnInit(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');

    try {
      await this.pedidos.cargarTodos();
    } catch (err) {
      const fallo = err as Error;
      this.error.set(fallo.message);
    } finally {
      this.cargando.set(false);
    }

    await this.hub.iniciar();
  }

  ngAfterViewInit(): void {
    this.mapaLeaflet = this.mapa.crearMapa('mapaAdmin');
    this.capa = L.layerGroup().addTo(this.mapaLeaflet);
  }

  ngOnDestroy(): void {
    if (this.mapaLeaflet) {
      this.mapaLeaflet.remove();
      this.mapaLeaflet = null;
      this.capa = null;
    }
  }

  seleccionar(pedido: Pedido): void {
    this.mensaje.set('');
    this.pedidoSeleccionado.set(pedido);
    this.dibujar(pedido);
  }

  async mover(paso: number): Promise<void> {
    const seleccionado = this.pedidoSeleccionado();
    if (!seleccionado) return;

    const nuevoPunto = seleccionado.indiceActual + paso;
    if (nuevoPunto < 0 || nuevoPunto > this.ultimoPunto) return;

    this.moviendo.set(true);
    this.exito.set(false);
    this.mensaje.set('');

    try {
      const actualizado = await this.pedidos.actualizarUbicacion(seleccionado.id, nuevoPunto);
      this.pedidoSeleccionado.set(actualizado);
      this.dibujar(actualizado);
      this.exito.set(true);
      this.mensaje.set('Pedido ' + actualizado.id + ': ' + actualizado.estado + '.');

      try {
        await this.hub.enviarEnvio({
          id: actualizado.id,
          estado: actualizado.estado,
          indiceActual: actualizado.indiceActual,
          puntosRuta: this.mapa.construirRuta(actualizado.latitudDestino, actualizado.longitudDestino)
        });
      } catch (err) {
        console.error('No se pudo avisar por SignalR:', err);
        this.exito.set(false);
        this.mensaje.set('El cambio se guardó, pero no se pudo avisar en tiempo real.');
      }
    } catch (err) {
      const fallo = err as Error;
      this.mensaje.set(fallo.message);
    } finally {
      this.moviendo.set(false);
    }
  }

  private dibujar(pedido: Pedido): void {
    const mapaLeaflet = this.mapaLeaflet;
    const capa = this.capa;
    if (!mapaLeaflet || !capa) return;

    capa.clearLayers();

    const ruta = this.mapa
      .construirRuta(pedido.latitudDestino, pedido.longitudDestino)
      .map((texto) => this.mapa.parsearCoordenadas(texto));

    L.polyline(ruta, { color: 'blue' }).addTo(capa);

    ruta.forEach((punto, i) => {
      const esPaquete = i === pedido.indiceActual;
      const color = esPaquete ? 'red' : 'blue';
      let nombre = this.mapa.nombrePunto(i, ruta.length);
      if (esPaquete) nombre = nombre + ' (paquete aquí)';

      L.circleMarker(punto, {
        radius: esPaquete ? 11 : 7,
        color: color,
        fillColor: color,
        fillOpacity: 0.8
      })
        .bindTooltip(nombre, { permanent: true, direction: 'top' })
        .addTo(capa);
    });

    mapaLeaflet.fitBounds(L.latLngBounds(ruta), { padding: [40, 40] });
  }
}