using Datos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modelos;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly TiendaContext _bd;

        public CategoriasController(TiendaContext bd)
        {
            _bd = bd;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodas()
        {
            var categorias = await _bd.Categorias.OrderBy(c => c.Nombre).ToListAsync();
            return Ok(categorias);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var categoria = await _bd.Categorias.FindAsync(id);
            if (categoria == null)
            {
                return NotFound(new { mensaje = "Categoría no encontrada." });
            }
            return Ok(categoria);
        }

        [HttpPost]
        public async Task<IActionResult> Crear(Categoria datos)
        {
            var nombre = datos.Nombre.Trim();
            if (nombre == "")
            {
                return BadRequest(new { mensaje = "El nombre es obligatorio." });
            }

            if (await _bd.Categorias.AnyAsync(c => c.Nombre == nombre))
            {
                return Conflict(new { mensaje = "Ya existe una categoría con ese nombre." });
            }

            var categoria = new Categoria
            {
                Nombre = nombre,
                Descripcion = datos.Descripcion
            };

            _bd.Categorias.Add(categoria);
            await _bd.SaveChangesAsync();
            return CreatedAtAction(nameof(ObtenerPorId), new { id = categoria.Id }, categoria);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Actualizar(int id, Categoria datos)
        {
            var categoria = await _bd.Categorias.FindAsync(id);
            if (categoria == null)
            {
                return NotFound(new { mensaje = "Categoría no encontrada." });
            }

            var nombre = datos.Nombre.Trim();
            if (nombre == "")
            {
                return BadRequest(new { mensaje = "El nombre es obligatorio." });
            }

            if (await _bd.Categorias.AnyAsync(c => c.Nombre == nombre && c.Id != id))
            {
                return Conflict(new { mensaje = "Ya existe una categoría con ese nombre." });
            }

            categoria.Nombre = nombre;
            categoria.Descripcion = datos.Descripcion;
            await _bd.SaveChangesAsync();
            return Ok(categoria);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var categoria = await _bd.Categorias.FindAsync(id);
            if (categoria == null)
            {
                return NotFound(new { mensaje = "Categoría no encontrada." });
            }

            if (await _bd.Productos.AnyAsync(p => p.IdCategoria == id))
            {
                return Conflict(new { mensaje = "No se puede eliminar: la categoría tiene productos." });
            }

            _bd.Categorias.Remove(categoria);
            await _bd.SaveChangesAsync();
            return NoContent();
        }
    }
}
