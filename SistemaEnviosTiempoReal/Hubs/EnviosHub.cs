using Microsoft.AspNetCore.SignalR;

namespace Hubs
{
    public class EnviosHub : Hub
    {
        private readonly ILogger<EnviosHub> _logger;

        public EnviosHub(ILogger<EnviosHub> logger)
        {
            _logger = logger;
        }

        public async Task EnviarCoordenadas(string informacionEnvioJson)
        {
            if (string.IsNullOrWhiteSpace(informacionEnvioJson))
            {
                throw new HubException("La información del envío está vacía.");
            }

            _logger.LogInformation("Envío recibido de {ConnectionId}: {Json}", Context.ConnectionId, informacionEnvioJson);
            await Clients.All.SendAsync("RecibirCoordenadas", informacionEnvioJson);
        }

        public override Task OnConnectedAsync()
        {
            _logger.LogInformation("Cliente conectado: {ConnectionId}", Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Cliente desconectado: {ConnectionId}", Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
