import { Categoria } from './categoria';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  existencia: number;
  imagen: string | null;
  idCategoria: number;
  categoria: Categoria | null;
}

export interface ProductoNuevo {
  nombre: string;
  descripcion: string | null;
  precio: number;
  existencia: number;
  imagen: string | null;
  idCategoria: number;
}
