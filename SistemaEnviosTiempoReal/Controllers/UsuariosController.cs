using System.Security.Cryptography;
using System.Text;
using Datos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modelos;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly TiendaContext _bd;

        public UsuariosController(TiendaContext bd)
        {
            _bd = bd;
        }

        private static string CalcularHash(string texto)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(texto));
            return Convert.ToHexString(bytes);
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos()
        {
            var usuarios = await _bd.Usuarios.OrderBy(u => u.Nombre).ToListAsync();
            return Ok(usuarios);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var usuario = await _bd.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado." });
            }
            return Ok(usuario);
        }

        [HttpPost("login")]
        public async Task<IActionResult> IniciarSesion(LoginSolicitud solicitud)
        {
            var correo = solicitud.Correo.Trim().ToLower();
            var hash = CalcularHash(solicitud.Contrasena);

            var usuario = await _bd.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == correo && u.Contrasena == hash);

            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos." });
            }
            return Ok(usuario);
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registrar(RegistroSolicitud solicitud)
        {
            var nombre = solicitud.Nombre.Trim();
            var correo = solicitud.Correo.Trim().ToLower();

            if (nombre == "" || correo == "" || solicitud.Contrasena == "")
            {
                return BadRequest(new { mensaje = "Nombre, correo y contraseña son obligatorios." });
            }

            if (await _bd.Usuarios.AnyAsync(u => u.Correo == correo))
            {
                return Conflict(new { mensaje = "Ya existe un usuario con ese correo." });
            }

            var usuario = new Usuario
            {
                Nombre = nombre,
                Correo = correo,
                Contrasena = CalcularHash(solicitud.Contrasena),
                Rol = "cliente",
                Telefono = solicitud.Telefono,
                Direccion = solicitud.Direccion
            };

            _bd.Usuarios.Add(usuario);
            await _bd.SaveChangesAsync();
            return CreatedAtAction(nameof(ObtenerPorId), new { id = usuario.Id }, usuario);
        }
    }
}
