/* Layout e rotas: login público, painel e cadastro só com sessão */
import { Navigate, Route, Routes } from "react-router-dom";
import logo from "./assets/logo.svg";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import New from "./pages/New";
import { getSession } from "./lib/session";
import "./App.css";

/* Redireciona para o login quando não há sessão */
function Private({ children }) {
  return getSession()?.token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div className="container">
      <header>
        <img src={logo} alt="AirCnC" width="180" height="40" />
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="/new" element={<Private><New /></Private>} />
          <Route path="*" element={<p role="alert">Página não encontrada. <a href="/">Voltar ao início</a></p>} />
        </Routes>
      </main>
    </div>
  );
}
/* Fim de App.jsx */
