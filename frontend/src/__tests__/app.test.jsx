/* Testes do front: login, painel com pedidos pendentes e validação do cadastro */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { validateSpot } from "../pages/New";

vi.mock("socket.io-client", () => ({ io: () => ({ on: vi.fn(), disconnect: vi.fn() }) }));

let routes;
beforeEach(() => {
  cleanup();
  localStorage.clear();
  routes = {};
  globalThis.fetch = vi.fn(async (url, opts = {}) => {
    const key = `${opts.method || "GET"} ${new URL(url).pathname}`;
    const [status, body] = routes[key] || [404, { errors: ["Rota não encontrada."] }];
    return { ok: status < 400, status, json: async () => body };
  });
});

/* Renderiza a aplicação em uma rota */
const renderAt = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe("login", () => {
  it("entra com e-mail e senha e abre o painel", async () => {
    routes["POST /sessions"] = [200, { user: { _id: "u1", email: "rh@loggi.com" }, token: "t1" }];
    routes["GET /dashboard"] = [200, []];
    routes["GET /bookings/pending"] = [200, []];
    renderAt("/");
    await userEvent.type(screen.getByLabelText(/E-MAIL/), "rh@loggi.com");
    await userEvent.type(screen.getByLabelText(/SENHA/), "senha-forte-123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText(/ainda não cadastrou spots/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("aircnc.session")).token).toBe("t1");
    const [, opts] = globalThis.fetch.mock.calls.find(([u]) => String(u).endsWith("/sessions"));
    expect(JSON.parse(opts.body)).toEqual({ email: "rh@loggi.com", password: "senha-forte-123" });
  });

  it("mostra o erro da API no formulário", async () => {
    routes["POST /sessions"] = [400, { errors: ["Informe um e-mail válido."] }];
    renderAt("/");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Informe um e-mail válido.");
  });

  it("painel sem sessão volta para o login", () => {
    renderAt("/dashboard");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeTruthy();
  });
});

describe("painel", () => {
  beforeEach(() => localStorage.setItem("aircnc.session", JSON.stringify({ token: "t", email: "rh@loggi.com" })));

  it("carrega pedidos pendentes e aprova um deles", async () => {
    routes["GET /dashboard"] = [200, [{ _id: "s1", company: "Loggi", price: 79.9, techs: ["Node"], thumbnail_url: "http://x/a.jpg" }]];
    routes["GET /bookings/pending"] = [200, [{ _id: "b1", date: "2026-10-10", user: { email: "dev@gmail.com" }, spot: { company: "Loggi" } }]];
    routes["POST /bookings/b1/approvals"] = [200, { _id: "b1", approved: true }];
    renderAt("/dashboard");
    const pedido = (await screen.findByText("dev@gmail.com")).closest("li");
    expect(pedido.textContent).toContain("10/10/2026");
    expect(screen.getByText(/R\$\s?79,90\/dia/)).toBeTruthy();
    await userEvent.click(within(pedido).getByRole("button", { name: "ACEITAR" }));
    expect(screen.queryByText("dev@gmail.com")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Reserva aprovada.");
  });
});

describe("cadastro de spot", () => {
  const img = { type: "image/png", size: 1000 };
  it("valida imagem, empresa, tecnologias e valor", () => {
    expect(validateSpot({ thumbnail: null, company: "", techs: "", price: "" })).toBe("Escolha uma imagem do espaço.");
    expect(validateSpot({ thumbnail: { type: "text/html", size: 1 }, company: "A", techs: "Go", price: "" })).toMatch(/JPEG/);
    expect(validateSpot({ thumbnail: { ...img, size: 3e6 }, company: "A", techs: "Go", price: "" })).toMatch(/2 MB/);
    expect(validateSpot({ thumbnail: img, company: "A", techs: " , ", price: "" })).toMatch(/tecnologia/);
    expect(validateSpot({ thumbnail: img, company: "A", techs: "Go", price: "abc" })).toMatch(/valor/);
    expect(validateSpot({ thumbnail: img, company: "A", techs: "Go", price: "79,90" })).toBe("");
  });
});
/* Fim de app.test.jsx */
