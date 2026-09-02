"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Car, Tag, Settings, LogOut, Menu, X, Sun, Moon } from "lucide-react";

const SENHA = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "mp2025";

const nav = [
  { href: "/admin", label: "Veículos", icon: Car },
  { href: "/admin/marcas", label: "Marcas", icon: Tag },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("mp_admin");
    setAutenticado(auth === "ok");
    const tema = localStorage.getItem("mp_admin_tema");
    setIsDark(tema === "dark");
  }, []);

  function toggleTema() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("mp_admin_tema", next ? "dark" : "light");
  }

  const dk = {
    bg:       isDark ? "#0f1117" : "#f7f6f3",
    surface:  isDark ? "#111827" : "#ffffff",
    border:   isDark ? "#1f2937" : "#e5e7eb",
    text:     isDark ? "#f3f4f6" : "#111827",
    muted:    isDark ? "#6b7280" : "#9ca3af",
    hover:    isDark ? "#1f2937" : "#f9fafb",
    navActive:isDark ? "#1f2937" : "#f3f4f6",
  };

  function login() {
    if (senha === SENHA) {
      sessionStorage.setItem("mp_admin", "ok");
      setAutenticado(true);
      setErro(false);
    } else {
      setErro(true);
    }
  }

  function sair() {
    sessionStorage.removeItem("mp_admin");
    setAutenticado(false);
    router.push("/admin");
  }

  if (autenticado === null) return null;

  if (!autenticado) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #002e12 0%, #003314cf 55%, #003918f2 100%)" }}
      >
        {/* Brilho suave */}
        <div
          className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
          style={{ background: "#00B040" }}
        />
        <div
          className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: "#00cc4d" }}
        />

        {/* Modal glassmorphism */}
        <div
          className="relative z-10 w-full max-w-sm mx-4 md:mx-0 rounded-3xl px-8 py-10 min-h-screen md:min-h-0 flex flex-col justify-center"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.7)",
            boxShadow: "0 8px 40px rgba(0, 51, 20, 0.12)",
          }}
        >
          {/* Logo + título */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <Image
                src="/logos/mp/logo-seminovos-bg-green.png"
                alt="MP Seminovos"
                width={72}
                height={72}
                className="rounded-2xl shadow-lg"
                style={{ width: 72, height: 72 }}
              />
            </div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#00B040" }}>
              Gestão de estoque
            </p>
            <h1 className="text-2xl font-black text-gray-900 uppercase">MP Seminovos</h1>
            <p className="text-sm mt-1 text-gray-900 lowercase">Qualidade e agilidade</p>
          </div>

          {/* Formulário */}
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2 text-gray-900">
                Senha de acesso
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full rounded-xl text-gray-900 placeholder-gray-400 px-4 py-3 text-base focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: erro ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
                onFocus={e => { e.currentTarget.style.border = "2px solid #00B040"; e.currentTarget.style.background = "rgba(255,255,255,0.9)"; }}
                onBlur={e => { e.currentTarget.style.border = erro ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.7)"; }}
              />
              {erro && <p className="text-red-500 text-xs mt-1.5">Senha incorreta. Tente novamente.</p>}
            </div>

            <button
              onClick={login}
              className="w-full text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-colors shadow-lg"
              style={{ background: "#00B040", boxShadow: "0 4px 16px rgba(0,176,64,0.35)" }}
              onMouseEnter={e => e.currentTarget.style.background = "#009935"}
              onMouseLeave={e => e.currentTarget.style.background = "#00B040"}
            >
              ENTRAR
            </button>
          </div>

          {/* Rodapé */}
          <p className="text-center text-xs mt-10 text-gray-900">
            Feito pela{" "}
            <span className="font-bold" style={{ color: "#7c3aed" }}><a href="https://audis.online" target="_blank" rel="noopener noreferrer">AUDIS</a></span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme={isDark ? "dark" : "light"} style={{ background: dk.bg }}>
      {/* ── Header fixo no topo ── */}
      <header
        className="fixed top-0 inset-x-0 h-[60px] z-50 shadow-sm flex items-center px-4 gap-4"
        style={{ background: dk.surface, borderBottom: `1px solid ${dk.border}` }}
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <Image
            src={isDark ? "/logos/mp/sem-bglogo.png" : "/logos/mp/logo-seminovos-bg-green.png"}
            alt="MP"
            width={30}
            height={30}
            className="w-[30px] h-[30px] rounded-lg shrink-0"
          />
          <span className="font-light text-sm tracking-widest" style={{ color: dk.muted }}>MP Admin</span>
        </div>

        <div className="flex-1" />

        {/* Toggle tema */}
        <button
          onClick={toggleTema}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
          style={{ color: dk.muted }}
          title={isDark ? "Modo claro" : "Modo escuro"}
        >
          {isDark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
        </button>

        <button
          onClick={sair}
          className="flex items-center gap-2 h-8 px-3 rounded-md transition-colors text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: dk.muted }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          Sair
        </button>

        {/* Mobile: menu */}
        <button onClick={() => setSidebarAberta(!sidebarAberta)} className="md:hidden ml-1" style={{ color: dk.muted }}>
          {sidebarAberta ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <div className="flex pt-[60px] min-h-screen">
        {/* ── Sidebar desktop ── */}
        <aside
          className="hidden md:flex flex-col w-12 shrink-0 fixed left-0 top-[60px] h-[calc(100vh-60px)] z-40"
          style={{ background: dk.surface, borderRight: `1px solid ${dk.border}` }}
        >
          <nav className="flex-1 py-2 flex flex-col gap-0.5">
            {nav.map(({ href, label, icon: Icon }) => {
              const ativo = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className="relative flex items-center justify-center h-9 mx-1 rounded-md transition-colors group"
                  style={{ background: ativo ? dk.navActive : "transparent" }}
                  onMouseEnter={e => { if (!ativo) e.currentTarget.style.background = dk.hover; }}
                  onMouseLeave={e => { if (!ativo) e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon
                    size={17}
                    strokeWidth={ativo ? 2.25 : 1.75}
                    style={ativo ? { color: "#00B040" } : { color: dk.muted }}
                  />
                  {/* Tooltip */}
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wider rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarAberta && (
          <div className="md:hidden fixed inset-0 z-40 flex pt-[60px]" onClick={() => setSidebarAberta(false)}>
            <div
              className="w-52 h-full flex flex-col shadow-xl"
              style={{ background: dk.surface, borderRight: `1px solid ${dk.border}` }}
              onClick={e => e.stopPropagation()}
            >
              <nav className="flex-1 py-2">
                {nav.map(({ href, label, icon: Icon }) => {
                  const ativo = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarAberta(false)}
                      className="flex items-center gap-3 h-8 px-[11px] mx-1 rounded-md transition-colors"
                      style={{ background: ativo ? dk.navActive : "transparent" }}
                    >
                      <Icon size={17} strokeWidth={ativo ? 2.25 : 1.75} style={ativo ? { color: "#00B040" } : { color: dk.muted }} className="shrink-0" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: dk.muted }}>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1 bg-black/20" />
          </div>
        )}

        {/* ── Conteúdo ── */}
        <main className="flex-1 md:ml-12 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
