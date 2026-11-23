import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { Usuarios } from '../../servicios/usuarios';
import { CarritoCompras } from '../../servicios/carrito';
import { Pedidos } from '../../servicios/pedidos';
import { Almacenamiento } from '../../servicios/almacenamiento';
import { Mapa } from '../../servicios/mapa';
import { EnviosHub } from '../../servicios/envios-hub';
import { Pedido } from '../../modelos/pedido';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, AfterViewInit, OnDestroy {
  usuarios = inject(Usuarios);
  carrito = inject(CarritoCompras);
  private readonly pedidos = inject(Pedidos);
  private readonly almacenamiento = inject(Almacenamiento);
  private readonly mapa = inject(Mapa);
  private readonly hub = inject(EnviosHub);

  direccion = signal('');
  latitud = signal<number | null>(null);
  longitud = signal<number | null>(null);
  idPedido = signal<number | null>(null);
  enviando = signal(false);
  error = signal('');
  aviso = signal('');

  private mapaLeaflet: L.Map | null = null;
  private capa: L.LayerGroup | null = null;

  ngOnInit(): void {
    const borrador = this.almacenamiento.leerFormularioEnvio();

    if (borrador) {
      this.direccion.set(borrador.direccionEntrega);
      this.latitud.set(borrador.latitud);
      this.longitud.set(borrador.longitud);
      return;
    }

    const usuario = this.usuarios.usuarioActual();
    if (usuario && usuario.direccion) {
      this.direccion.set(usuario.direccion);
    }
  }

  ngAfterViewInit(): void {
    if (!this.usuarios.usuarioActual() || this.carrito.items().length === 0) return;

    this.mapaLeaflet = this.mapa.crearMapa('mapaEntrega');
    this.capa = L.layerGroup().addTo(this.mapaLeaflet);

    this.mapaLeaflet.on('click', (e) => {
      this.seleccionarPunto(e.latlng.lat, e.latlng.lng);
    });

    this.dibujar();

    const lat = this.latitud();
    const lng = this.longitud();
    if (lat !== null && lng !== null) {
      this.mapaLeaflet.setView([lat, lng], 14);
    }
  }

  ngOnDestroy(): void {
    this.destruirMapa();
  }

  private destruirMapa(): void {
    if (this.mapaLeaflet) {
      this.mapaLeaflet.remove();
      this.mapaLeaflet = null;
      this.capa = null;
    }
  }

  textoPunto(): string {
    const lat = this.latitud();
    const lng = this.longitud();
    if (lat === null || lng === null) return 'Sin seleccionar';
    return this.mapa.textoCoordenadas(lat, lng);
  }

  cambiarDireccion(texto: string): void {
    this.direccion.set(texto);
    this.guardarBorrador();
  }

  private guardarBorrador(): void {
    this.almacenamiento.guardarFormularioEnvio({
      direccionEntrega: this.direccion(),
      latitud: this.latitud(),
      longitud: this.longitud()
    });
  }

  private seleccionarPunto(lat: number, lng: number): void {
    this.latitud.set(lat);
    this.longitud.set(lng);
    this.guardarBorrador();
    this.dibujar();
  }

  private dibujar(): void {
    if (!this.capa) return;
    this.capa.clearLayers();

    const lat = this.latitud();
    const lng = this.longitud();
    if (lat === null || lng === null) return;

    const ruta = this.mapa
      .construirRuta(lat, lng)
      .map((texto) => this.mapa.parsearCoordenadas(texto));

    L.polyline(ruta, { color: 'blue' }).addTo(this.capa);

    ruta.forEach((punto, i) => {
      let color = 'blue';
      if (i === 0) color = 'green';
      else if (i === ruta.length - 1) color = 'red';

      L.circleMarker(punto, { radius: 8, color: color, fillColor: color, fillOpacity: 0.8 })
        .bindTooltip(this.mapa.nombrePunto(i, ruta.length), { permanent: true, direction: 'top' })
        .addTo(this.capa as L.LayerGroup);
    });
  }

  async usarMiUbicacion(): Promise<void> {
    this.error.set('');
    this.aviso.set('Solicitando ubicación…');

    try {
      const posicion = await this.mapa.obtenerUbicacion();
      this.seleccionarPunto(posicion[0], posicion[1]);
      if (this.mapaLeaflet) {
        this.mapaLeaflet.setView(posicion, 15);
      }
      this.aviso.set('Punto de entrega establecido con su ubicación.');
    } catch (err) {
      const fallo = err as Error;
      this.aviso.set('');
      this.error.set(fallo.message);
    }
  }

  async confirmar(): Promise<void> {
    const usuario = this.usuarios.usuarioActual();
    const direccion = this.direccion().trim();
    const lat = this.latitud();
    const lng = this.longitud();

    this.error.set('');
    this.aviso.set('');

    if (!usuario) return;

    if (!direccion) {
      this.error.set('Escriba la dirección de entrega.');
      return;
    }

    if (lat === null || lng === null) {
      this.error.set('Marque en el mapa el punto de entrega.');
      return;
    }

    this.enviando.set(true);

    try {
      const pedido = await this.pedidos.crear({
        idUsuario: usuario.id,
        direccionEntrega: direccion,
        latitudDestino: lat,
        longitudDestino: lng,
        items: this.carrito.items().map((i) => ({ idProducto: i.idProducto, cantidad: i.cantidad }))
      });

      this.carrito.vaciar();
      this.almacenamiento.borrarFormularioEnvio();
      this.destruirMapa();
      this.idPedido.set(pedido.id);
      await this.avisarEnvio(pedido);
    } catch (err) {
      const fallo = err as Error;
      this.error.set(fallo.message);
    } finally {
      this.enviando.set(false);
    }
  }

  private async avisarEnvio(pedido: Pedido): Promise<void> {
    try {
      const conectado = await this.hub.iniciar();

      if (!conectado) {
        this.aviso.set('El pedido se guardó, pero no se pudo avisar en tiempo real.');
        return;
      }

      await this.hub.enviarEnvio({
        id: pedido.id,
        estado: pedido.estado,
        indiceActual: pedido.indiceActual,
        puntosRuta: this.mapa.construirRuta(pedido.latitudDestino, pedido.longitudDestino)
      });
    } catch (err) {
      console.error('No se pudo avisar por SignalR:', err);
      this.aviso.set('El pedido se guardó, pero no se pudo avisar en tiempo real.');
    }
  }
}