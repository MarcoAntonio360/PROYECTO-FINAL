namespace Modelos
{
    public class LoginSolicitud
    {
        public string Correo { get; set; } = "";
        public string Contrasena { get; set; } = "";
    }

    public class RegistroSolicitud
    {
        public string Nombre { get; set; } = "";
        public string Correo { get; set; } = "";
        public string Contrasena { get; set; } = "";
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
    }

    public class ItemPedidoSolicitud
    {
        public int IdProducto { get; set; }
        public int Cantidad { get; set; }
    }

    public class PedidoSolicitud
    {
        public int IdUsuario { get; set; }
        public string DireccionEntrega { get; set; } = "";
        public decimal LatitudDestino { get; set; }
        public decimal LongitudDestino { get; set; }
        public List<ItemPedidoSolicitud> Items { get; set; } = new();
    }

    public class UbicacionSolicitud
    {
        public int IndiceActual { get; set; }
    }
}
