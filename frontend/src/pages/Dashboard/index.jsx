/* Painel da empresa: pedidos de reserva (carregados e em tempo real) e spots cadastrados */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api, API_URL } from "../../lib/api";
import { clearSession, getSession } from "../../lib/session";
import { dateBR, priceLabel } from "../../lib/format";
import "./styles.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [state, setState] = useState({ loading: true, error: "", notice: "" });

  /* Sai da conta e volta ao login */
  const logout = useCallback(() => { clearSession(); navigate("/"); }, [navigate]);

  useEffect(() => {
    let alive = true;
    Promise.all([api("/dashboard"), api("/bookings/pending")])
      .then(([s, r]) => { if (alive) { setSpots(s); setRequests(r); setState((st) => ({ ...st, loading: false })); } })
      .catch((err) => { if (!alive) return; if (err.status === 401) logout(); else setState({ loading: false, error: err.message, notice: "" }); });
    const socket = io(API_URL, { auth: { token: getSession()?.token } });
    socket.on("booking_request", (b) => setRequests((list) => (list.some((x) => x._id === b._id) ? list : [...list, b])));
    return () => { alive = false; socket.disconnect(); };
  }, [logout]);

  /* Aprova ou rejeita um pedido e o remove da lista */
  async function answer(id, kind) {
    try {
      await api(`/bookings/${id}/${kind}`, { method: "POST" });
      setRequests((list) => list.filter((r) => r._id !== id));
      setState((st) => ({ ...st, error: "", notice: kind === "approvals" ? "Reserva aprovada." : "Reserva rejeitada." }));
    } catch (err) {
      setState((st) => ({ ...st, error: err.message, notice: "" }));
    }
  }

  return (
    <>
      <div className="toolbar">
        <h1>Meus spots</h1>
        <button type="button" className="link" onClick={logout}>Sair ({getSession()?.email})</button>
      </div>
      <p className="sr-only" role="status">{state.notice}</p>
      {state.error && <p className="error" role="alert">{state.error}</p>}

      {requests.length > 0 && (
        <section aria-labelledby="req-title">
          <h2 id="req-title" className="sr-only">Pedidos de reserva</h2>
          <ul className="notifications">
            {requests.map((r) => (
              <li key={r._id}>
                <p><strong>{r.user?.email}</strong> está solicitando uma reserva em <strong>{r.spot?.company}</strong> para a data <strong>{dateBR(r.date)}</strong>.</p>
                <button type="button" className="accept" onClick={() => answer(r._id, "approvals")}>ACEITAR</button>
                <button type="button" className="reject" onClick={() => answer(r._id, "rejections")}>REJEITAR</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.loading ? <p role="status">Carregando spots…</p> : spots.length === 0 && !state.error ? (
        <p className="empty">Você ainda não cadastrou spots. Comece pelo botão abaixo.</p>
      ) : (
        <ul className="spot-list">
          {spots.map((s) => (
            <li key={s._id}>
              <img src={s.thumbnail_url} alt="" loading="lazy" width="200" height="120" />
              <strong>{s.company}</strong>
              <span>{priceLabel(s.price)}</span>
              <span className="techs">{s.techs.join(", ")}</span>
            </li>
          ))}
        </ul>
      )}
      <Link to="/new" className="btn">Cadastrar novo spot</Link>
    </>
  );
}
/* Fim de Dashboard/index.jsx */
