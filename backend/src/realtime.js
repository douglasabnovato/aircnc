/* Tempo real com Socket.IO: o cliente se autentica com o token e recebe eventos só na própria sala */
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

/* Maior espera aceita pelo setTimeout (cerca de 24,8 dias) */
const MAX_TIMEOUT = 2 ** 31 - 1;

/* Anexa o Socket.IO ao servidor HTTP e devolve a função notify(userId, evento, dados) */
function attachRealtime(httpServer, config) {
  const io = new Server(httpServer, { cors: { origin: config.corsOrigins } });
  io.use((socket, next) => {
    try {
      const payload = jwt.verify(String(socket.handshake.auth?.token || ""), config.authSecret);
      socket.data.userId = payload.sub;
      socket.data.exp = payload.exp;
      return next();
    } catch {
      return next(new Error("unauthorized"));
    }
  });
  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
    /* A conexão não vive mais que o token: quando o exp passa, avisa o cliente e desconecta */
    if (typeof socket.data.exp === "number") {
      let timer;
      /* Validade acima do limite do setTimeout: espera em etapas até o exp */
      const schedule = () => {
        const ms = socket.data.exp * 1000 - Date.now();
        if (ms <= 0) { socket.emit("session_expired"); socket.disconnect(true); return; }
        timer = setTimeout(schedule, Math.min(ms, MAX_TIMEOUT));
      };
      socket.on("disconnect", () => clearTimeout(timer));
      schedule();
    }
  });
  return { io, notify: (userId, event, payload) => io.to(`user:${userId}`).emit(event, payload) };
}

module.exports = { attachRealtime };
/* Fim de realtime.js */
