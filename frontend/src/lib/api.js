/* Cliente HTTP da API: base configurável, token Bearer e mensagens de erro em português */
import { clearSession, getSession } from "./session";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/* Chama a API; body pode ser objeto (JSON) ou FormData */
export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getSession()?.token;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body instanceof FormData ? body : body && JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "Não foi possível falar com o servidor. Verifique sua conexão.");
  }
  const data = await res.json().catch(() => null);
  if (res.status === 401) clearSession();
  if (!res.ok) throw new ApiError(res.status, data?.errors?.join(" ") || "Algo deu errado. Tente novamente.");
  return data;
}
/* Fim de api.js */
