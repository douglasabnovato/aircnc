/* API Express 5 do AirCnC: sessão por e-mail e senha com token assinado, spots com imagem e reservas com aprovação do dono */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const v = require("./lib/validation");
const { createUpload, discard } = require("./upload");
const { hashPassword, verifyPassword } = require("./lib/password");

/* Monta a API com repositórios, notificador em tempo real e configuração injetados */
function createApp({ repos, config, notify = () => undefined, today = v.todayBR }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: config.corsOrigins, allowedHeaders: ["Authorization", "Content-Type"] }));
  app.use(express.json({ limit: "20kb" }));
  app.use("/files", express.static(config.uploadDir, { maxAge: "7d", fallthrough: false }));

  const upload = createUpload(config.uploadDir);
  const sessionLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false, message: { errors: ["Muitas tentativas. Aguarde alguns minutos."] } });

  /* Formato público do spot: URL da imagem e sem o id do dono */
  const publicSpot = ({ user, ...s }) => ({ ...s, thumbnail_url: `${config.publicUrl}/files/${encodeURIComponent(s.thumbnail)}` });
  /* Formato da reserva para o dono: e-mail de quem pediu e spot público */
  const publicBooking = (b) => ({ _id: b._id, date: b.date, approved: b.approved, user: b.user && { email: b.user.email }, spot: b.spot && publicSpot(b.spot) });

  /* Valida o corpo e responde 400 no formato { errors: [] } */
  function parse(schema, body, res) {
    const r = schema.safeParse(body);
    if (!r.success) { res.status(400).json({ errors: v.messages(r.error) }); return null; }
    return r.data;
  }

  /* Exige token válido e coloca o id do usuário em req.userId */
  function auth(req, res, next) {
    const h = String(req.headers.authorization || "");
    try {
      req.userId = jwt.verify(h.startsWith("Bearer ") ? h.slice(7) : "", config.authSecret).sub;
      return next();
    } catch {
      return res.status(401).json({ errors: ["Sessão expirada. Entre novamente."] });
    }
  }

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  /* Entrar ou criar conta: e-mail novo cria a conta com a senha; e-mail existente exige a senha certa */
  app.post("/sessions", sessionLimiter, async (req, res) => {
    const data = parse(v.session, req.body, res);
    if (!data) return;
    const invalid = () => res.status(401).json({ errors: ["E-mail ou senha incorretos."] });
    let user = await repos.users.findByEmail(data.email);
    if (!user) {
      try {
        user = await repos.users.create(data.email, await hashPassword(data.password));
      } catch (err) {
        if (err.code !== "DUPLICATE") throw err;
        user = await repos.users.findByEmail(data.email);
        if (!(await verifyPassword(data.password, user && user.passwordHash))) return invalid();
      }
    } else if (!user.passwordHash) {
      const claimed = await repos.users.claim(user._id, await hashPassword(data.password));
      const fresh = claimed ? null : await repos.users.findByEmail(data.email);
      if (!claimed && !(await verifyPassword(data.password, fresh && fresh.passwordHash))) return invalid();
    } else if (!(await verifyPassword(data.password, user.passwordHash))) {
      return invalid();
    }
    const token = jwt.sign({ sub: user._id }, config.authSecret, { expiresIn: config.tokenTtl });
    res.json({ user: { _id: user._id, email: user.email }, token });
  });

  app.get("/spots", async (req, res) => {
    const tech = String(req.query.tech || "").trim();
    if (!tech) return res.status(400).json({ errors: ["Informe a tecnologia em ?tech=."] });
    res.json((await repos.spots.byTech(tech.slice(0, 30))).map(publicSpot));
  });

  app.post("/spots", auth, (req, res, next) => upload(req, res, (err) => {
    if (!err) return next();
    const msg = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter no máximo 2 MB." : err.status === 400 ? err.message : "Falha no envio da imagem.";
    return res.status(400).json({ errors: [msg] });
  }), async (req, res) => {
    if (!req.file) return res.status(400).json({ errors: ["Envie a imagem do spot."] });
    const data = parse(v.spot, req.body, res);
    if (!data) return discard(req.file);
    if (!(await repos.users.findById(req.userId))) { discard(req.file); return res.status(401).json({ errors: ["Usuário não encontrado. Entre novamente."] }); }
    const spot = await repos.spots.create({ ...data, thumbnail: req.file.filename, user: req.userId });
    res.status(201).json(publicSpot(spot));
  });

  app.get("/dashboard", auth, async (req, res) => {
    res.json((await repos.spots.byOwner(req.userId)).map(publicSpot));
  });

  app.get("/bookings/pending", auth, async (req, res) => {
    const mine = await repos.spots.byOwner(req.userId);
    const list = mine.length ? await repos.bookings.pendingForSpots(mine.map((s) => s._id)) : [];
    res.json(list.filter(Boolean).map(publicBooking));
  });

  app.post("/spots/:spot_id/bookings", auth, async (req, res) => {
    const data = parse(v.booking(today()), req.body, res);
    if (!data) return;
    const spot = await repos.spots.findById(req.params.spot_id);
    if (!spot) return res.status(404).json({ errors: ["Spot não encontrado."] });
    if (String(spot.user) === req.userId) return res.status(400).json({ errors: ["Você não pode reservar o próprio spot."] });
    try {
      const booking = await repos.bookings.create({ user: req.userId, spot: spot._id, date: data.date });
      notify(String(spot.user), "booking_request", publicBooking(booking));
      res.status(201).json(publicBooking(booking));
    } catch (err) {
      if (err.code === "DUPLICATE") return res.status(409).json({ errors: ["Você já pediu reserva deste spot nesta data."] });
      throw err;
    }
  });

  /* Aprovação ou rejeição: só o dono do spot decide, uma única vez */
  const decide = (approved) => async (req, res) => {
    const booking = await repos.bookings.findById(req.params.booking_id);
    if (!booking || !booking.spot) return res.status(404).json({ errors: ["Reserva não encontrada."] });
    if (String(booking.spot.user) !== req.userId) return res.status(403).json({ errors: ["Só o dono do spot pode responder a reserva."] });
    if (booking.approved !== null) return res.status(409).json({ errors: ["Esta reserva já foi respondida."] });
    const updated = await repos.bookings.setApproved(booking._id, approved);
    notify(String(booking.user._id), "booking_response", publicBooking(updated));
    res.json(publicBooking(updated));
  };
  app.post("/bookings/:booking_id/approvals", auth, decide(true));
  app.post("/bookings/:booking_id/rejections", auth, decide(false));

  app.use((req, res) => res.status(404).json({ errors: ["Rota não encontrada."] }));

  /* Erro inesperado: registra no servidor e responde sem detalhes internos */
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err.type === "entity.parse.failed") return res.status(400).json({ errors: ["JSON inválido."] });
    if (err.status === 404 || err.statusCode === 404) return res.status(404).json({ errors: ["Arquivo não encontrado."] });
    console.error(err);
    return res.status(500).json({ errors: ["Erro interno. Tente novamente."] });
  });

  return app;
}

module.exports = { createApp };
/* Fim de app.js */
