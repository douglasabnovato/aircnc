/* Tela de entrada: e-mail e senha da empresa (e-mail novo cria a conta) */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { saveSession } from "../../lib/session";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /* Envia e-mail e senha e guarda o token recebido */
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { user, token } = await api("/sessions", { method: "POST", body: { email, password } });
      saveSession({ token, email: user.email });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="lead">Ofereça <strong>spots</strong> para programadores e encontre <strong>talentos</strong> para sua empresa.</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">E-MAIL *</label>
        <input id="email" type="email" autoComplete="email" required placeholder="Seu melhor e-mail" value={email}
          onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} />
        <label htmlFor="password">SENHA * <small>(mínimo 8 caracteres; no primeiro acesso ela cria a conta)</small></label>
        <input id="password" type="password" autoComplete="current-password" required minLength={8} maxLength={72} value={password}
          onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} />
        {error && <p id="login-error" className="error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
      </form>
    </>
  );
}
/* Fim de Login/index.jsx */
