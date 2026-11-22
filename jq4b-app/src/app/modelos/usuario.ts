export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  telefono: string | null;
  direccion: string | null;
}

export interface RegistroUsuario {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string | null;
  direccion: string | null;
}
