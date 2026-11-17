using System.ComponentModel.DataAnnotations.Schema;

namespace Modelos
{
    [Table("pedidos")]
    public class Pedido
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; }

        [Column("total", TypeName = "decimal(10,2)")]
        public decimal Total { get; set; }

        [Column("estado")]
        public string Estado { get; set; } = "En Recolección";

        [Column("direccion_entrega")]
        public string DireccionEntrega { get; set; } = "";

        [Column("latitud_destino", TypeName = "decimal(9,6)")]
        public decimal LatitudDestino { get; set; }

        [Column("longitud_destino", TypeName = "decimal(9,6)")]
        public decimal LongitudDestino { get; set; }

        [Column("indice_actual")]
        public int IndiceActual { get; set; }

        public Usuario? Usuario { get; set; }

        public List<DetallePedido> Detalles { get; set; } = new();
    }
}
