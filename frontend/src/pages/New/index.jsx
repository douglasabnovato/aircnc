/* Cadastro de spot: imagem com pré-visualização, empresa, tecnologias e valor da diária */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import camera from "../../assets/camera.svg";
import "./styles.css";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 2 * 1024 * 1024;

/* Valida os campos antes de enviar; devolve a primeira mensagem de erro */
export function validateSpot({ thumbnail, company, techs, price }) {
  if (!thumbnail) return "Escolha uma imagem do espaço.";
  if (!TYPES.includes(thumbnail.type)) return "Envie uma imagem JPEG, PNG ou WebP.";
  if (thumbnail.size > MAX) return "A imagem deve ter no máximo 2 MB.";
  if (!company.trim()) return "Informe o nome da empresa.";
  if (!techs.split(",").some((t) => t.trim())) return "Informe ao menos uma tecnologia.";
  if (price.trim() && !(Number(price.replace(",", ".")) >= 0)) return "Informe o valor em reais (ex.: 80 ou 79,90).";
  return "";
}

export default function New() {
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState(null);
  const [company, setCompany] = useState("");
  const [techs, setTechs] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => (thumbnail ? URL.createObjectURL(thumbnail) : null), [thumbnail]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  /* Valida e envia o formulário como multipart */
  async function handleSubmit(event) {
    event.preventDefault();
    const msg = validateSpot({ thumbnail, company, techs, price });
    setError(msg);
    if (msg) return;
    const data = new FormData();
    data.append("thumbnail", thumbnail);
    data.append("company", company.trim());
    data.append("techs", techs);
    data.append("price", price.trim().replace(",", "."));
    setBusy(true);
    try {
      await api("/spots", { method: "POST", body: data });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="sr-only">Cadastrar spot</h1>
      <input id="thumbnail" className="file" type="file" accept={TYPES.join(",")} onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
      <label htmlFor="thumbnail" className={`thumbnail ${thumbnail ? "has-thumbnail" : ""}`} style={preview ? { backgroundImage: `url(${preview})` } : undefined}>
        <span className="sr-only">Imagem do spot (JPEG, PNG ou WebP até 2 MB)</span>
        <img src={camera} alt="" aria-hidden="true" />
      </label>

      <label htmlFor="company">EMPRESA *</label>
      <input id="company" maxLength={80} placeholder="Sua empresa incrível" value={company} onChange={(e) => setCompany(e.target.value)} />

      <label htmlFor="techs">TECNOLOGIAS * <span>(separadas por vírgula)</span></label>
      <input id="techs" placeholder="Quais tecnologias usam?" value={techs} onChange={(e) => setTechs(e.target.value)} />

      <label htmlFor="price">VALOR DA DIÁRIA <span>(em branco para GRATUITO)</span></label>
      <input id="price" inputMode="decimal" placeholder="Valor cobrado por dia" value={price} onChange={(e) => setPrice(e.target.value)} />

      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn" disabled={busy}>{busy ? "Cadastrando…" : "Cadastrar"}</button>
      <Link to="/dashboard" className="back">Voltar ao painel</Link>
    </form>
  );
}
/* Fim de New/index.jsx */
