using Datos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modelos;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private const int UltimoIndice = 2;

        private readonly TiendaContext _bd;

        public PedidosController(TiendaContext bd)
        {
            _bd = bd;
        }

        private IQueryable<Pedido> ConsultaCompleta()
        {
            return _bd.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
                        .ThenInclude(pr => pr!.Categoria);
        }

        private static string EstadoSegunIndice(int indice)
        {
            if (indice == 0) return "En Recolección";
            if (indice == UltimoIndice) return "Entregado";
            return "En Distribución";
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos()
        {
            var pedidos = await ConsultaCompleta().OrderByDescending(p => p.Fecha).ToListAsync();
            return Ok(pedidos);
        }

        [HttpGet("usuario/{idUsuario:int}")]
        public async Task<IActionResult> ObtenerPorUsuario(int idUsuario)
        {
            var pedidos = await ConsultaCompleta()
                .Where(p => p.IdUsuario == idUsuario)
                .OrderByDescending(p => p.Fecha)
                .ToListAsync();
            return Ok(pedidos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var pedido = await ConsultaCompleta().FirstOrDefaultAsync(p => p.Id == id);
            if (pedido == null)
            {
                return NotFound(new { mensaje = "Pedido no encontrado." });
            }
            return Ok(pedido);
        }

        [HttpPost]
        public async Task<IActionResult> Crear(PedidoSolicitud solicitud)
        {
            if (solicitud.Items.Count == 0)
            {
                return BadRequest(new { mensaje = "El pedido no tiene productos." });
            }

            if (solicitud.DireccionEntrega.Trim() == "")
            {
                return BadRequest(new { mensaje = "La dirección de entrega es obligatoria." });
            }

            var usuario = await _bd.Usuarios.FindAsync(solicitud.IdUsuario);
            if (usuario == null)
            {
                return BadRequest(new { mensaje = "El usuario indicado no existe." });
            }

            var pedido = new Pedido
            {
                IdUsuario = solicitud.IdUsuario,
                Fecha = DateTime.Now,
                Estado = "En Recolección",
                DireccionEntrega = solicitud.DireccionEntrega.Trim(),
                LatitudDestino = solicitud.LatitudDestino,
                LongitudDestino = solicitud.LongitudDestino,
                IndiceActual = 0
            };

            decimal total = 0;

            foreach (var item in solicitud.Items)
            {
                if (item.Cantidad <= 0)
                {
                    return BadRequest(new { mensaje = "La cantidad debe ser mayor a cero." });
                }

                var producto = await _bd.Productos.FindAsync(item.IdProducto);
                if (producto == null)
                {
                    return BadRequest(new { mensaje = "Uno de los productos no existe." });
                }

                if (producto.Existencia < item.Cantidad)
                {
                    return BadRequest(new { mensaje = "No hay existencia suficiente de " + producto.Nombre + "." });
                }

                producto.Existencia -= item.Cantidad;

                var subtotal = producto.Precio * item.Cantidad;
                total += subtotal;

                pedido.Detalles.Add(new DetallePedido
                {
                    IdProducto = producto.Id,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Subtotal = subtotal
                });
            }

            pedido.Total = total;

            _bd.Pedidos.Add(pedido);
            await _bd.SaveChangesAsync();

            var pedidoCompleto = await ConsultaCompleta().FirstAsync(p => p.Id == pedido.Id);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = pedido.Id }, pedidoCompleto);
        }

        [HttpPut("{id:int}/ubicacion")]
        public async Task<IActionResult> ActualizarUbicacion(int id, UbicacionSolicitud solicitud)
        {
            if (solicitud.IndiceActual < 0 || solicitud.IndiceActual > UltimoIndice)
            {
                return BadRequest(new { mensaje = "El punto de la ruta no es válido." });
            }

            var pedido = await _bd.Pedidos.FindAsync(id);
            if (pedido == null)
            {
                return NotFound(new { mensaje = "Pedido no encontrado." });
            }

            pedido.IndiceActual = solicitud.IndiceActual;
            pedido.Estado = EstadoSegunIndice(solicitud.IndiceActual);
            await _bd.SaveChangesAsync();

            var pedidoCompleto = await ConsultaCompleta().FirstAsync(p => p.Id == id);
            return Ok(pedidoCompleto);
        }
    }
}
