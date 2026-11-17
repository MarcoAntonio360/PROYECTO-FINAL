using Datos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modelos;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly TiendaContext _bd;

        public ProductosController(TiendaContext bd)
        {
            _bd = bd;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos([FromQuery] int? idCategoria)
        {
            var consulta = _bd.Productos.Include(p => p.Categoria).AsQueryable();

            if (idCategoria != null)
            {
                consulta = consulta.Where(p => p.IdCategoria == idCategoria);
            }

            var productos = await consulta.OrderBy(p => p.Nombre).ToListAsync();
            return Ok(productos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var producto = await _bd.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null)
            {
                return NotFound(new { mensaje = "Producto no encontrado." });
            }
            return Ok(producto);
        }

        [HttpPost]
        public async Task<IActionResult> Crear(Producto datos)
        {
            if (datos.Nombre.Trim() == "" || datos.Precio < 0 || datos.Existencia < 0)
            {
                return BadRequest(new { mensaje = "Revise el nombre, el precio y la existencia." });
            }

            if (!await _bd.Categorias.AnyAsync(c => c.Id == datos.IdCategoria))
            {
                return BadRequest(new { mensaje = "La categoría indicada no existe." });
            }

            var producto = new Producto
            {
                Nombre = datos.Nombre.Trim(),
                Descripcion = datos.Descripcion,
                Precio = datos.Precio,
                Existencia = datos.Existencia,
                Imagen = datos.Imagen,
                IdCategoria = datos.IdCategoria
            };

            _bd.Productos.Add(producto);
            await _bd.SaveChangesAsync();
            return CreatedAtAction(nameof(ObtenerPorId), new { id = producto.Id }, producto);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Actualizar(int id, Producto datos)
        {
            var producto = await _bd.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound(new { mensaje = "Producto no encontrado." });
            }

            if (datos.Nombre.Trim() == "" || datos.Precio < 0 || datos.Existencia < 0)
            {
                return BadRequest(new { mensaje = "Revise el nombre, el precio y la existencia." });
            }

            if (!await _bd.Categorias.AnyAsync(c => c.Id == datos.IdCategoria))
            {
                return BadRequest(new { mensaje = "La categoría indicada no existe." });
            }

            producto.Nombre = datos.Nombre.Trim();
            producto.Descripcion = datos.Descripcion;
            producto.Precio = datos.Precio;
            producto.Existencia = datos.Existencia;
            producto.Imagen = datos.Imagen;
            producto.IdCategoria = datos.IdCategoria;

            await _bd.SaveChangesAsync();
            return Ok(producto);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var producto = await _bd.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound(new { mensaje = "Producto no encontrado." });
            }

            if (await _bd.DetallePedidos.AnyAsync(d => d.IdProducto == id))
            {
                return Conflict(new { mensaje = "No se puede eliminar: el producto ya aparece en pedidos." });
            }

            _bd.Productos.Remove(producto);
            await _bd.SaveChangesAsync();
            return NoContent();
        }
    }
}
