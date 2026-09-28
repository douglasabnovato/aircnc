/* Sessão no navegador (token e e-mail); o acesso ao storage é protegido para modo privado */
const KEY = "aircnc.session";

/* Lê a sessão salva ou null */
export function getSession() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}

/* Salva a sessão após o login */
export function saveSession(session) {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* storage indisponível: sessão só na memória da aba */ }
}

/* Remove a sessão (sair ou token expirado) */
export function clearSession() {
  try { localStorage.removeItem(KEY); } catch { /* nada a limpar */ }
}
/* Fim de session.js */
