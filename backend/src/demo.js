/* Servidor de demonstração local: mesma API e tempo real, com dados em memória e sem MongoDB (some ao parar) */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { loadConfig } = require("./config");
const { createApp } = require("./app");
const { createMemoryRepos } = require("./repositories/memory");
const { attachRealtime } = require("./realtime");

/* Sobe a API em memória; as imagens vão para uma pasta temporária, fora do repositório */
function startDemo(env = process.env) {
  if (env.NODE_ENV === "production") throw new Error("O modo demonstração não roda em produção.");
  const uploadDir = env.UPLOAD_DIR ? path.resolve(env.UPLOAD_DIR) : fs.mkdtempSync(path.join(os.tmpdir(), "aircnc-demo-"));
  const config = { ...loadConfig(env), uploadDir };
  let realtime = { notify: () => undefined };
  const app = createApp({ repos: createMemoryRepos(), config, notify: (...a) => realtime.notify(...a) });
  const server = http.createServer(app);
  realtime = attachRealtime(server, config);
  server.listen(config.port, () => console.log(`API de demonstração (em memória) em http://localhost:${config.port}`));
  return server;
}

if (require.main === module) startDemo();

module.exports = { startDemo };
/* Fim de demo.js */
