const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Archivos estáticos
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Datos de la encuesta
const encuesta = {
  pregunta: '¿Cuál es tu lenguaje de programación favorito?',
  opciones: {
    'JavaScript': 0,
    'Python': 0,
    'Java': 0,
    'C#': 0,
    'PHP': 0
  }
};

const votosRegistrados = new Set();

// Eventos de Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.emit('encuesta:estado', encuesta);
  io.emit('usuarios:conteo', io.engine.clientsCount);

  socket.on('encuesta:votar', (opcion) => {
    if (votosRegistrados.has(socket.id)) {
      socket.emit('encuesta:error', '¡Ya votaste!');
      return;
    }
    encuesta.opciones[opcion]++;
    votosRegistrados.add(socket.id);
    io.emit('encuesta:resultado', encuesta);
  });

  socket.on('reaccion:enviar', (emoji) => {
    socket.broadcast.emit('reaccion:mostrar', emoji);
    socket.emit('reaccion:mostrar', emoji);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    io.emit('usuarios:conteo', io.engine.clientsCount);
  });
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});