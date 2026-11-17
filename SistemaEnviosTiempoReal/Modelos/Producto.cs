using System.ComponentModel.DataAnnotations.Schema;

namespace Modelos
{
    [Table("productos")]
    public class Producto
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = "";

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("precio", TypeName = "decimal(10,2)")]
        public decimal Precio { get; set; }

        [Column("existencia")]
        public int Existencia { get; set; }

        [Column("imagen")]
        public string? Imagen { get; set; }

        [Column("id_categoria")]
        public int IdCategoria { get; set; }

        public Categoria? Categoria { get; set; }
    }
}
