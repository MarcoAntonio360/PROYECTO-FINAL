import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { Usuarios } from '../../servicios/usuarios';
import { Pedidos } from '../../servicios/pedidos';
import { Mapa } from '../../servicios/mapa';
import { EnviosHub } from '../../servicios/envios-hub';
import { Pedido } from '../../modelos/pedido';
import { Envio } from '../../modelos/envio';

@Component({
  selector: 'app-mis-pedidos',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css',
})
export class MisPedidos implements OnInit, AfterViewInit, OnDestroy {
  usuarios = inject(Usuarios);
  pedidos = inject(Pedidos);
  hub = inject(EnviosHub);
  private readonly mapa = inject(Mapa);

  cargando = signal(false);
  error = signal('');
  pedidoSeleccionado = signal<Pedido | null>(null);

  private mapaLeaflet: L.Map | null = null;
  private capa: L.LayerGroup | null = null;

  async ngOnInit(): Promise<void> {
    const usuario = this.usuarios.usuarioActual();
    if (!usuario) return;

    this.hub.alRecibirEnvio((envio) => this.actualizarEnvio(envio));

    this.pedidos.pedidos.set([]);
    this.cargando.set(true);
    this.error.set('');

    try {
      await this.pedidos.cargarDeUsuario(usuario.id);
    } catch (err) {
      const fallo = err as Error;
      this.error.set(fallo.message);
    } finally {
      this.cargando.set(false);
    }

    await this.hub.iniciar();
  }

  ngAfterViewInit(): void {
    if (!this.usuarios.usuarioActual()) return;

    this.mapaLeaflet = this.mapa.crearMapa('mapaSeguimiento');
    this.capa = L.layerGroup().addTo(this.mapaLeaflet);
  }

  ngOnDestroy(): void {
    this.hub.limpiarEscuchas();

    if (this.mapaLeaflet) {
      this.mapaLeaflet.remove();
      this.mapaLeaflet = null;
      this.capa = null;
    }
  }

  verSeguimiento(pedido: Pedido): void {
    this.pedidoSeleccionado.set(pedido);
    this.dibujar(pedido);
  }

  private actualizarEnvio(envio: Envio): void {
    this.pedidos.pedidos.update((lista) =>
      lista.map((pedido) =>
        pedido.id === envio.id
          ? { ...pedido, estado: envio.estado, indiceActual: envio.indiceActual }
          : pedido
      )
    );

    const seleccionado = this.pedidoSeleccionado();
    if (seleccionado && seleccionado.id === envio.id) {
      const actualizado = {
        ...seleccionado,
        estado: envio.estado,
        indiceActual: envio.indiceActual
      };
      this.pedidoSeleccionado.set(actualizado);
      this.dibujar(actualizado);
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