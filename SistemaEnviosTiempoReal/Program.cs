using Datos;
using Hubs;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.AddDbContext<TiendaContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TiendaDb")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirClientes", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseWebSockets();
app.UseCors("PermitirClientes");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/salud", () => Results.Ok(new { estado = "OK", hora = DateTime.Now }));

app.MapGet("/api/salud-bd", async (TiendaContext bd) =>
{
    var conectado = await bd.Database.CanConnectAsync();
    var productos = conectado ? await bd.Productos.CountAsync() : 0;
    return Results.Ok(new { conectado = conectado, productos = productos });
});

app.MapHub<EnviosHub>("/enviosHub", options =>
{
    options.Transports = HttpTransportType.WebSockets |
                         HttpTransportType.ServerSentEvents |
                         HttpTransportType.LongPolling;
});

app.Run();
