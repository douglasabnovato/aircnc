/* Tempo real com Socket.IO: o cliente se autentica com o token e recebe eventos só na própria sala */
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

/* Anexa o Socket.IO ao servidor HTTP e devolve a função notify(userId, evento, dados) */
function attachRealtime(httpServer, config) {
  const io = new Server(httpServer, { cors: { origin: config.corsOrigins } });
  io.use((socket, next) => {
    try {
      socket.data.userId = jwt.verify(String(socket.handshake.auth?.token || ""), config.authSecret).sub;
      return next();
    } catch {
      return next(new Error("unauthorized"));
    }
  });
  io.on("connection", (socket) => socket.join(`user:${socket.data.userId}`));
  return { io, notify: (userId, event, payload) => io.to(`user:${userId}`).emit(event, payload) };
}

module.exports = { attachRealtime };
/* Fim de realtime.js */
