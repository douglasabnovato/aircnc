/* Fluxo principal na tela: empresa entra, cadastra spot, recebe pedido em tempo real e aprova; aprovação em dobro é recusada.
   O axe confere as telas de login, cadastro e painel com pedido pendente */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const API = "http://localhost:3333";
const PNG = readFileSync(new URL("../public/favicon.png", import.meta.url));
const run = Date.now().toString(36);
const empresa = `rh-${run}@demo.test`;
const tech = `Elixir${run}`;

/* Data futura no formato da API (AAAA-MM-DD) */
const inDays = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/* Roda o axe (WCAG 2.1 A e AA) e falha com violação ou com contraste que ele não conseguiu medir */
async function semViolacoes(page, tela) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const resumo = (lista) => lista.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(resumo(r.violations), `violações do axe em ${tela}`).toEqual([]);
  expect(resumo(r.incomplete.filter((v) => v.id === "color-contrast")), `contraste não medido em ${tela}`).toEqual([]);
}

/* O dev faz o que o app móvel faz: entra, busca spots pela tecnologia e pede reserva */
async function devPedeReserva(request, email, date) {
  const s = await request.post(`${API}/sessions`, { data: { email, password: "senha-demo-123" } });
  expect(s.ok()).toBeTruthy();
  const { token } = await s.json();
  const spots = await (await request.get(`${API}/spots?tech=${tech}`)).json();
  expect(spots).toHaveLength(1);
  const b = await request.post(`${API}/spots/${spots[0]._id}/bookings`, { data: { date }, headers: { Authorization: `Bearer ${token}` } });
  expect(b.status()).toBe(201);
}

test("empresa cadastra spot e aprova a reserva pedida pelo app", async ({ page, request }) => {
  await page.goto("/");
  await semViolacoes(page, "login");
  await page.getByLabel(/E-MAIL/).fill(empresa);
  await page.getByLabel(/SENHA/).fill("senha-demo-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText(/ainda não cadastrou spots/)).toBeVisible();

  await page.getByRole("link", { name: "Cadastrar novo spot" }).click();
  await expect(page.getByLabel(/EMPRESA/)).toBeVisible();
  await semViolacoes(page, "cadastro");
  await page.locator("#thumbnail").setInputFiles({ name: "spot.png", mimeType: "image/png", buffer: PNG });
  await page.getByLabel(/EMPRESA/).fill("Loggi Demo");
  await page.getByLabel(/TECNOLOGIAS/).fill(`${tech}, React`);
  await page.getByLabel(/VALOR DA DIÁRIA/).fill("79,90");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const spot = page.locator(".spot-list li").filter({ hasText: "Loggi Demo" });
  await expect(spot).toContainText(/R\$\s?79,90\/dia/);
  await expect.poll(() => spot.locator("img").evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);

  const data = inDays(7);
  const dataBR = data.split("-").reverse().join("/");
  await devPedeReserva(request, `dev1-${run}@demo.test`, data);
  const pedido1 = page.locator(".notifications li").filter({ hasText: `dev1-${run}@demo.test` });
  await expect(pedido1).toContainText(dataBR);
  await semViolacoes(page, "painel com pedido");
  await pedido1.getByRole("button", { name: "ACEITAR" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Reserva aprovada." })).toBeAttached();
  await expect(pedido1).toHaveCount(0);

  await devPedeReserva(request, `dev2-${run}@demo.test`, data);
  const pedido2 = page.locator(".notifications li").filter({ hasText: `dev2-${run}@demo.test` });
  await pedido2.getByRole("button", { name: "ACEITAR" }).click();
  await expect(page.getByRole("alert")).toHaveText(/Já existe uma reserva aprovada/);
  await expect(pedido2).toBeVisible();
  await pedido2.getByRole("button", { name: "REJEITAR" }).click();
  await expect(pedido2).toHaveCount(0);

  await page.reload();
  await expect(page.locator(".spot-list li").filter({ hasText: "Loggi Demo" })).toBeVisible();
  await expect(page.locator(".notifications li")).toHaveCount(0);
});
/* O app não tem tema escuro (sem prefers-color-scheme no CSS): no lugar do escuro, celular de 375 px sem rolagem lateral */
test("login no celular: axe sem violações e sem rolagem lateral", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await semViolacoes(page, "login no celular");
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(largura).toBeLessThanOrEqual(375);
});
/* Fim de fluxo.e2e.js */
