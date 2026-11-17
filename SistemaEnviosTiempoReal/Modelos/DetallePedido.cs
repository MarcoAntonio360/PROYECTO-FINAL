using System.ComponentModel.DataAnnotations.Schema;

namespace Modelos
{
    [Table("detalle_pedidos")]
    public class DetallePedido
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("id_pedido")]
        public int IdPedido { get; set; }

        [Column("id_producto")]
        public int IdProducto { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("precio_unitario", TypeName = "decimal(10,2)")]
        public decimal PrecioUnitario { get; set; }

        [Column("subtotal", TypeName = "decimal(10,2)")]
        public decimal Subtotal { get; set; }

        public Producto? Producto { get; set; }
    }
}
