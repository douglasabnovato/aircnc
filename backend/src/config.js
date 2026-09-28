/* Configuração por variáveis de ambiente (12-Factor); falha cedo se faltar o essencial em produção */
require("dotenv").config();
const path = require("node:path");

/* Lê e valida a configuração do processo */
function loadConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const authSecret = env.AUTH_SECRET || (production ? "" : "dev-secret-troque-em-producao-0123456789");
  if (authSecret.length < 32) throw new Error("AUTH_SECRET precisa ter 32+ caracteres.");
  if (production && !env.MONGODB_URI) throw new Error("MONGODB_URI é obrigatório em produção.");
  return {
    port: Number(env.PORT) || 3333,
    mongoUri: env.MONGODB_URI || "mongodb://127.0.0.1:27017/aircnc",
    authSecret,
    tokenTtl: env.TOKEN_TTL || "7d",
    corsOrigins: (env.CORS_ORIGINS || "http://localhost:5173").split(",").map((s) => s.trim()).filter(Boolean),
    publicUrl: (env.PUBLIC_URL || `http://localhost:${Number(env.PORT) || 3333}`).replace(/\/$/, ""),
    uploadDir: path.resolve(env.UPLOAD_DIR || path.join(__dirname, "..", "uploads")),
  };
}

module.exports = { loadConfig };
/* Fim de config.js */
