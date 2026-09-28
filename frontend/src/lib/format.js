/* Formatação de valores para exibição em pt-BR */
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/* Preço por dia ou GRATUITO */
export function priceLabel(price) {
  return price ? `${brl.format(price)}/dia` : "GRATUITO";
}

/* "2026-10-05" → "05/10/2026" */
export function dateBR(iso) {
  const [y, m, d] = String(iso).split("-");
  return d ? `${d}/${m}/${y}` : String(iso);
}
/* Fim de format.js */
