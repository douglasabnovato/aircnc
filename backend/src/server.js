/* Ponto de entrada: conecta no MongoDB, sobe HTTP + Socket.IO e encerra com elegância */
const http = require("node:http");
const mongoose = require("mongoose");
const { loadConfig } = require("./config");
const { createApp } = require("./app");
const { createMongoRepos } = require("./repositories/mongo");
const { attachRealtime } = require("./realtime");

/* Inicializa dependências e servidor */
async function main() {
  const config = loadConfig();
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 });
  let realtime = { notify: () => undefined };
  const app = createApp({ repos: createMongoRepos(), config, notify: (...a) => realtime.notify(...a) });
  const server = http.createServer(app);
  realtime = attachRealtime(server, config);
  server.listen(config.port, () => console.log(`API em http://localhost:${config.port}`));
  const stop = () => server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

main().catch((err) => {
  console.error("Falha ao iniciar:", err.message);
  process.exit(1);
});
/* Fim de server.js */
