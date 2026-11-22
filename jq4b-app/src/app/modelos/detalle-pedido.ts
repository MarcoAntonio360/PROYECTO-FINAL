import { Producto } from './producto';

export interface DetallePedido {
  id: number;
  idPedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: Producto | null;
}
