/* Testes do repositório do MongoDB (banco real em memória): reservas e o índice que impede duas aprovações no mesmo spot e data */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createApp } = require("../src/app");
const { createMongoRepos } = require("../src/repositories/mongo");
const { loadConfig } = require("../src/config");
const Booking = require("../src/models/Booking");
const User = require("../src/models/User");

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "aircnc-mongo-"));
const config = { ...loadConfig({ AUTH_SECRET: "x".repeat(32), PUBLIC_URL: "http://api.test" }), uploadDir };
const PNG = Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex");
const repos = createMongoRepos();
const app = createApp({ repos, config, today: () => "2026-09-27" });
let mongod;

/* Faz login e devolve o token */
async function login(email) {
  const r = await request(app).post("/sessions").send({ email, password: "senha-forte-123" });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return r.body.token;
}
/* Cadastra um spot com imagem e devolve o id */
async function newSpot(token, company) {
  const r = await request(app).post("/spots").set("Authorization", `Bearer ${token}`)
    .field("company", company).field("techs", "Elixir").field("price", "80")
    .attach("thumbnail", PNG, { filename: "spot.png", contentType: "image/png" });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body._id;
}
/* Dev pede reserva e devolve a resposta */
const book = (token, spotId, date) => request(app).post(`/spots/${spotId}/bookings`).set("Authorization", `Bearer ${token}`).send({ date });
const approve = (token, id) => request(app).post(`/bookings/${id}/approvals`).set("Authorization", `Bearer ${token}`);

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("aircnc-teste"));
  /* Garante os índices antes dos testes (no servidor real eles sobem em segundo plano) */
  await Promise.all([Booking.init(), User.init()]);
}, { timeout: 180_000 });

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  fs.rmSync(uploadDir, { recursive: true, force: true });
});

describe("reservas com o repositório do MongoDB", () => {
  let owner, dev, spotId, bookingId;
  before(async () => {
    owner = await login("host@startup.test");
    dev = await login("dev@demo.test");
    spotId = await newSpot(owner, "Startup");
  });

  test("e-mail repetido não cria segunda conta; senha errada é recusada", async () => {
    const errada = await request(app).post("/sessions").send({ email: "host@startup.test", password: "outra-senha-1" });
    assert.equal(errada.status, 401);
    assert.equal(await User.countDocuments({ email: "host@startup.test" }), 1);
  });

  test("dev pede reserva; pedido duplicado responde 409; dono vê o pendente", async () => {
    const r = await book(dev, spotId, "10/10/2026");
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.user.email, "dev@demo.test");
    assert.equal(r.body.spot.company, "Startup");
    bookingId = r.body._id;
    assert.equal((await book(dev, spotId, "2026-10-10")).status, 409);
    const pend = await request(app).get("/bookings/pending").set("Authorization", `Bearer ${owner}`);
    assert.deepEqual(pend.body.map((b) => b._id), [bookingId]);
  });

  test("só o dono aprova, uma vez só", async () => {
    assert.equal((await approve(dev, bookingId)).status, 403);
    const ok = await approve(owner, bookingId);
    assert.equal(ok.status, 200);
    assert.equal(ok.body.approved, true);
    assert.equal((await approve(owner, bookingId)).status, 409);
  });

  test("duas aprovações em paralelo no mesmo spot e data: um 200 e um 409", async () => {
    const dia = "15/10/2026";
    const a = await book(await login("dev-a@demo.test"), spotId, dia);
    const b = await book(await login("dev-b@demo.test"), spotId, dia);
    assert.equal(a.status, 201);
    assert.equal(b.status, 201);
    const status = (await Promise.all([approve(owner, a.body._id), approve(owner, b.body._id)])).map((r) => r.status).sort();
    assert.deepEqual(status, [200, 409]);
    assert.equal(await Booking.countDocuments({ spot: spotId, date: "2026-10-15", approved: true }), 1);
  });
});

describe("índice de aprovação única", () => {
  test("o banco recusa a segunda aprovação mesmo sem a checagem da API (erro 11000 vira DUPLICATE)", async () => {
    const owner = await login("dona@indice.test");
    const spotId = await newSpot(owner, "Indice");
    const devs = await Promise.all(["i1@demo.test", "i2@demo.test"].map(login));
    const [a, b] = await Promise.all(devs.map((t) => book(t, spotId, "20/10/2026")));
    await repos.bookings.setApproved(a.body._id, true);
    await assert.rejects(repos.bookings.setApproved(b.body._id, true), (err) => err.code === "DUPLICATE");
    const rejeitada = await repos.bookings.setApproved(b.body._id, false);
    assert.equal(rejeitada.approved, false, "rejeitar continua possível");
  });
});
/* Fim de mongo.test.js */
