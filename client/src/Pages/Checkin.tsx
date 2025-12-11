import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function LogoIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="26" fill="#0D9488" />
      <circle cx="50" cy="34" r="14" fill="white" />
      <path d="M32 62C32 54.268 40.507 48 50 48C59.493 48 68 54.268 68 62V78H32V62Z" fill="white" />
      <path d="M70 55C78 57.8 82 64 82 70V78H70V55Z" fill="white" />
    </svg>
  );
}

export default function Checkin() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [fields, setFields] = useState({ email: "", senha: "", nome: "" });
  const [error, setError] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const passwordCheck = (s: string) => {
    const req: string[] = [];
    if (s.length <= 6) req.push("Mínimo 7 caracteres");
    if (!/[A-Z]/.test(s)) req.push("1 letra maiúscula");
    if (!/\d/.test(s)) req.push("1 número");
    if (!/[@#$%^&+=!]/.test(s)) req.push("1 caractere especial");
    setMissing(req);
    return req.length === 0;
  };

  const emailValid = (m: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m);
  };

  const checkEmailExists = async (email: string) => {
    try {
      const r = await fetch("/users/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      return d.exists;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!fields.email || !fields.senha || (tab === "register" && !fields.nome)) {
      setError("Preencha os campos obrigatórios");
      return;
    }
    if (!emailValid(fields.email)) {
      setError("Email inválido");
      return;
    }
    if (!passwordCheck(fields.senha)) {
      setError("Senha não atende aos requisitos");
      return;
    }
    if (tab === "register") {
      const exists = await checkEmailExists(fields.email);
      if (exists) {
        setError("Email já cadastrado");
        return;
      }
    }
    try {
      const endpoint = tab === "login" ? "/users/login" : "/users/register";
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tab === "login"
            ? { email: fields.email, senha: fields.senha }
            : { nome: fields.nome, email: fields.email, senha: fields.senha }
        ),
      });
      if (!r.ok) {
        const d = await r.json();
        setError(d.message || "Erro na requisição");
        return;
      }
      navigate("/dashboard");
    } catch {
      setError("Falha ao conectar com servidor");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-teal-50/80">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white shadow-xl rounded-2xl w-[390px] p-6 grid gap-4">
        <div className="flex flex-col items-center">
          <LogoIcon />
          <h1 className="text-lg font-semibold mt-2 text-gray-800">Casa de Apoio</h1>
          <p className="text-xs text-gray-500">Sistema de Registro de Visitas</p>
        </div>

        <div className="bg-teal-200/50 p-1 rounded-xl flex relative">
          <button onClick={() => { setTab("login"); setMissing([]); }} className="flex-1 z-10 text-sm font-semibold py-2 text-gray-700">Entrar</button>
          <button onClick={() => { setTab("register"); setMissing([]); }} className="flex-1 z-10 text-sm font-semibold py-2 text-gray-700">Criar Conta</button>
          <motion.div layout transition={{ type: "spring", duration: 0.4 }} className="absolute bg-teal-600 h-[86%] w-[49%] top-[7%] rounded-lg shadow-md" style={{ left: tab === "login" ? "1.5%" : "50.5%" }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: tab === "login" ? 10 : -10 }} transition={{ duration: 0.25 }} className="grid gap-3">
            {tab === "register" && (
              <div className="grid gap-1">
                <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                <input name="nome" placeholder="Seu nome" onChange={handleChange} value={fields.nome} className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-teal-500" />
              </div>
            )}
            <div className="grid gap-1">
              <label className="text-sm font-medium text-gray-600">E-mail</label>
              <input name="email" placeholder="seu@email.com" onChange={handleChange} value={fields.email} className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-teal-500" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium text-gray-600">Senha</label>
              <input type="password" name="senha" placeholder="*******" onChange={(e) => { handleChange(e); passwordCheck(e.target.value); }} value={fields.senha} className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-teal-500" />
              {tab === "register" && missing.length > 0 && (
                <div className="text-[11px] font-semibold text-red-500 grid justify-start gap-[2px] mt-1 pl-1">
                  {missing.map((m, i) => <span key={i}>{m}</span>)}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && <span className="text-red-500 text-xs font-semibold text-center">{error}</span>}

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} className="bg-teal-600 text-white font-semibold py-2.5 rounded-xl mt-2 text-sm shadow-md">
          {tab === "login" ? "Entrar" : "Criar Conta"}
        </motion.button>
      </motion.div>
    </div>
  );
}