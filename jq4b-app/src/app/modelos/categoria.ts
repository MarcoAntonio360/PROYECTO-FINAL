export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface CategoriaNueva {
  nombre: string;
  descripcion: string | null;
}
