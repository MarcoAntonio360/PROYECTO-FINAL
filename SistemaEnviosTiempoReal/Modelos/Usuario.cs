using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Modelos
{
    [Table("usuarios")]
    public class Usuario
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = "";

        [Column("correo")]
        public string Correo { get; set; } = "";

        [Column("contrasena")]
        [JsonIgnore]
        public string Contrasena { get; set; } = "";

        [Column("rol")]
        public string Rol { get; set; } = "cliente";

        [Column("telefono")]
        public string? Telefono { get; set; }

        [Column("direccion")]
        public string? Direccion { get; set; }
    }
}
