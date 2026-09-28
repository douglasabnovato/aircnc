/* Testes da API (repositórios em memória) e do tempo real (Socket.IO com token) */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const request = require("supertest");
const { io: ioClient } = require("socket.io-client");
const { createApp } = require("../src/app");
const { createMemoryRepos } = require("../src/repositories/memory");
const { attachRealtime } = require("../src/realtime");
const { loadConfig } = require("../src/config");
const { normalizeDate, parseTechs } = require("../src/lib/validation");

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "aircnc-"));
const config = { ...loadConfig({ AUTH_SECRET: "x".repeat(32), PUBLIC_URL: "http://api.test" }), uploadDir };
const PNG = Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex");
const events = [];
const app = createApp({ repos: createMemoryRepos(), config, notify: (...e) => events.push(e), today: () => "2026-09-27" });

/* Faz login e devolve o token */
async function login(email) {
  const r = await request(app).post("/sessions").send({ email, password: "senha-forte-123" });
  return r.body.token;
}
/* Cadastra um spot com imagem */
function newSpot(token, fields = {}) {
  const req = request(app).post("/spots").set("Authorization", `Bearer ${token}`);
  const f = { company: "Loggi", techs: "Node, React, node", price: "80", ...fields };
  for (const [k, val] of Object.entries(f)) req.field(k, val);
  return req.attach("thumbnail", PNG, { filename: "../../evil.png", contentType: "image/png" });
}

describe("regras puras", () => {
  test("datas DD/MM/AAAA e ISO, recusando datas inexistentes", () => {
    assert.equal(normalizeDate("05/10/2026"), "2026-10-05");
    assert.equal(normalizeDate("2026-10-05"), "2026-10-05");
    assert.equal(normalizeDate("31/02/2026"), null);
    assert.equal(normalizeDate("amanhã"), null);
  });
  test("tecnologias sem vazios e sem duplicados", () => {
    assert.deepEqual(parseTechs(" Node, React, node,, "), ["Node", "React"]);
  });
});

describe("sessão e spots", () => {
  test("login por e-mail e senha devolve token; e-mail inválido ou senha curta é recusado", async () => {
    const ok = await request(app).post("/sessions").send({ email: "Empresa@Loggi.com ", password: "senha-forte-123" });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.user.email, "empresa@loggi.com");
    assert.ok(ok.body.token);
    assert.equal(ok.body.user.passwordHash, undefined);
    const bad = await request(app).post("/sessions").send({ email: "x", password: "senha-forte-123" });
    assert.equal(bad.status, 400);
    const curta = await request(app).post("/sessions").send({ email: "a@b.com", password: "123" });
    assert.equal(curta.status, 400);
  });

  test("quem sabe só o e-mail não entra na conta de outra pessoa (antes bastava o e-mail)", async () => {
    await request(app).post("/sessions").send({ email: "dona@spot.com", password: "senha-da-dona" });
    const intruso = await request(app).post("/sessions").send({ email: "dona@spot.com", password: "outra-senha-1" });
    assert.equal(intruso.status, 401);
    assert.equal(intruso.body.token, undefined);
    const dona = await request(app).post("/sessions").send({ email: "dona@spot.com", password: "senha-da-dona" });
    assert.equal(dona.status, 200);
  });

  test("rotas privadas exigem token (antes bastava o header user_id)", async () => {
    const r = await request(app).get("/dashboard").set("user_id", "qualquer");
    assert.equal(r.status, 401);
  });

  test("cadastra spot com nome de arquivo aleatório, preço e techs normalizados", async () => {
    const token = await login("dono@empresa.com");
    const r = await newSpot(token);
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.deepEqual(r.body.techs, ["Node", "React"]);
    assert.equal(r.body.price, 80);
    assert.ok(!r.body.thumbnail.includes(".."));
    assert.match(r.body.thumbnail_url, /^http:\/\/api\.test\/files\//);
    assert.equal(r.body.user, undefined);
    const file = await request(app).get(`/files/${r.body.thumbnail}`);
    assert.equal(file.status, 200);
  });

  test("recusa arquivo que não é imagem e campos inválidos", async () => {
    const token = await login("dono@empresa.com");
    const txt = await request(app).post("/spots").set("Authorization", `Bearer ${token}`).field("company", "A").field("techs", "Go")
      .attach("thumbnail", Buffer.from("oi"), { filename: "a.html", contentType: "text/html" });
    assert.equal(txt.status, 400);
    assert.match(txt.body.errors[0], /JPEG, PNG ou WebP/);
    const semTech = await newSpot(token, { techs: " , " });
    assert.equal(semTech.status, 400);
    assert.deepEqual(semTech.body.errors, ["Informe ao menos uma tecnologia."]);
  });

  test("busca por tecnologia ignora maiúsculas; sem tech responde 400", async () => {
    const r = await request(app).get("/spots").query({ tech: "react" });
    assert.equal(r.status, 200);
    assert.ok(r.body.length >= 1);
    assert.equal((await request(app).get("/spots")).status, 400);
  });
});

describe("reservas", () => {
  let owner, dev, other, spotId, bookingId;
  before(async () => {
    owner = await login("host@startup.com");
    dev = await login("dev@gmail.com");
    other = await login("intruso@gmail.com");
    spotId = (await newSpot(owner, { company: "Startup", techs: "Elixir" })).body._id;
  });

  test("dev pede reserva e o dono é notificado; data no passado e duplicada são recusadas", async () => {
    events.length = 0;
    const r = await request(app).post(`/spots/${spotId}/bookings`).set("Authorization", `Bearer ${dev}`).send({ date: "10/10/2026" });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.date, "2026-10-10");
    bookingId = r.body._id;
    assert.equal(events[0][1], "booking_request");
    assert.equal(events[0][2].user.email, "dev@gmail.com");
    const past = await request(app).post(`/spots/${spotId}/bookings`).set("Authorization", `Bearer ${dev}`).send({ date: "01/01/2020" });
    assert.equal(past.status, 400);
    const dup = await request(app).post(`/spots/${spotId}/bookings`).set("Authorization", `Bearer ${dev}`).send({ date: "2026-10-10" });
    assert.equal(dup.status, 409);
  });

  test("dono vê os pedidos pendentes mesmo depois de recarregar a página", async () => {
    const r = await request(app).get("/bookings/pending").set("Authorization", `Bearer ${owner}`);
    assert.equal(r.body.length, 1);
    assert.equal(r.body[0].spot.company, "Startup");
  });

  test("só o dono aprova (antes qualquer um aprovava por GET); resposta chega ao dev", async () => {
    const nope = await request(app).post(`/bookings/${bookingId}/approvals`).set("Authorization", `Bearer ${other}`);
    assert.equal(nope.status, 403);
    events.length = 0;
    const ok = await request(app).post(`/bookings/${bookingId}/approvals`).set("Authorization", `Bearer ${owner}`);
    assert.equal(ok.status, 200);
    assert.equal(ok.body.approved, true);
    assert.equal(events[0][1], "booking_response");
    const again = await request(app).post(`/bookings/${bookingId}/rejections`).set("Authorization", `Bearer ${owner}`);
    assert.equal(again.status, 409);
  });

  test("dono não reserva o próprio spot; spot inexistente responde 404", async () => {
    const own = await request(app).post(`/spots/${spotId}/bookings`).set("Authorization", `Bearer ${owner}`).send({ date: "10/10/2026" });
    assert.equal(own.status, 400);
    const none = await request(app).post("/spots/nao-existe/bookings").set("Authorization", `Bearer ${dev}`).send({ date: "10/10/2026" });
    assert.equal(none.status, 404);
  });
});

describe("tempo real", () => {
  let server, realtime, url;
  before(async () => {
    server = http.createServer();
    realtime = attachRealtime(server, config);
    await new Promise((r) => server.listen(0, r));
    url = `http://127.0.0.1:${server.address().port}`;
  });
  after(() => { realtime.io.close(); server.close(); });

  test("socket sem token é recusado; com token recebe só os próprios eventos", async () => {
    const anon = ioClient(url, { transports: ["websocket"], reconnection: false });
    const err = await new Promise((r) => anon.on("connect_error", r));
    assert.equal(err.message, "unauthorized");
    anon.close();

    const token = await login("socket@teste.com");
    const { sub } = JSON.parse(Buffer.from(token.split(".")[1], "base64url"));
    const c = ioClient(url, { transports: ["websocket"], auth: { token }, reconnection: false });
    await new Promise((r) => c.on("connect", r));
    const got = new Promise((r) => c.on("booking_response", r));
    realtime.notify("outro-usuario", "booking_response", { x: 0 });
    realtime.notify(sub, "booking_response", { x: 1 });
    assert.deepEqual(await got, { x: 1 });
    c.close();
  });
});

after(() => fs.rmSync(uploadDir, { recursive: true, force: true }));
/* Fim de api.test.js */
