import { DetallePedido } from './detalle-pedido';
import { Usuario } from './usuario';

export interface Pedido {
  id: number;
  idUsuario: number;
  fecha: string;
  total: number;
  estado: string;
  direccionEntrega: string;
  latitudDestino: number;
  longitudDestino: number;
  indiceActual: number;
  usuario: Usuario | null;
  detalles: DetallePedido[];
}

export interface NuevoItemPedido {
  idProducto: number;
  cantidad: number;
}

export interface NuevoPedido {
  idUsuario: number;
  direccionEntrega: string;
  latitudDestino: number;
  longitudDestino: number;
  items: NuevoItemPedido[];
}
