/* Esquemas de entrada (zod) e regras puras de domínio: datas de reserva, tecnologias e preço */
const { z } = require("zod");

/* Converte "DD/MM/AAAA" ou "AAAA-MM-DD" em "AAAA-MM-DD"; devolve null se a data não existir */
function normalizeDate(input) {
  const s = String(input || "").trim();
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  let y, mo, d;
  if (m) [, d, mo, y] = m;
  else if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/))) [, y, mo, d] = m;
  else return null;
  const dt = new Date(Date.UTC(+y, +mo - 1, +d));
  if (dt.getUTCFullYear() !== +y || dt.getUTCMonth() !== +mo - 1 || dt.getUTCDate() !== +d) return null;
  return `${y}-${mo}-${d}`;
}

/* Lista de tecnologias: separa por vírgula, remove vazios e duplicados (sem diferenciar maiúsculas) */
function parseTechs(input) {
  const seen = new Set();
  return String(input || "").split(",").map((t) => t.trim()).filter((t) => {
    const k = t.toLowerCase();
    if (!t || t.length > 30 || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 10);
}

const session = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(120),
  password: z.string({ required_error: "Informe a senha." }).min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72, "A senha pode ter no máximo 72 caracteres."),
});

const spot = z.object({
  company: z.string().trim().min(1, "Informe o nome da empresa.").max(80, "Nome da empresa muito longo."),
  techs: z.string().transform(parseTechs).refine((l) => l.length > 0, "Informe ao menos uma tecnologia."),
  price: z.union([z.literal(""), z.undefined(), z.coerce.number().min(0, "O valor não pode ser negativo.").max(100000)])
    .transform((v) => (v === "" || v === undefined ? 0 : Math.round(v * 100) / 100)),
});

/* Data da reserva: válida e não anterior a hoje (fuso de Brasília) */
function booking(today = todayBR()) {
  return z.object({
    date: z.string().transform((v, ctx) => {
      const iso = normalizeDate(v);
      if (!iso) { ctx.addIssue({ code: "custom", message: "Informe a data no formato DD/MM/AAAA." }); return z.NEVER; }
      if (iso < today) { ctx.addIssue({ code: "custom", message: "A data não pode estar no passado." }); return z.NEVER; }
      return iso;
    }),
  });
}

/* Data de hoje em America/Sao_Paulo no formato AAAA-MM-DD */
function todayBR(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

/* Mensagens legíveis a partir de um erro do zod */
function messages(error) {
  return error.issues.map((i) => i.message);
}

module.exports = { normalizeDate, parseTechs, session, spot, booking, todayBR, messages };
/* Fim de validation.js */
