/* Cliente da API para o app: URL por variável EXPO_PUBLIC_API_URL, token Bearer e erros em português */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333").replace(/\/$/, "");

/* Chama a API e devolve o JSON; lança Error com a mensagem do servidor */
export async function api(path, { method = "GET", body } = {}) {
  const token = await AsyncStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Sem conexão com o servidor. Confira a internet e o endereço da API.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.errors?.join(" ") || "Algo deu errado. Tente novamente.");
    err.status = res.status;
    throw err;
  }
  return data;
}

/* Tecnologias digitadas → lista sem vazios e sem duplicados */
export function splitTechs(text) {
  const seen = new Set();
  return String(text || "").split(",").map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
}

/* Preço por dia ou GRATUITO */
export function priceLabel(price) {
  return price ? `R$ ${Number(price).toFixed(2).replace(".", ",")}/dia` : "GRATUITO";
}

/* "2026-10-05" → "05/10/2026" */
export function dateBR(iso) {
  const [y, m, d] = String(iso).split("-");
  return d ? `${d}/${m}/${y}` : String(iso);
}
/* Fim de api.js */
