using System.ComponentModel.DataAnnotations.Schema;

namespace Modelos
{
    [Table("categorias")]
    public class Categoria
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = "";

        [Column("descripcion")]
        public string? Descripcion { get; set; }
    }
}
