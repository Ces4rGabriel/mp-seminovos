"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Car, Tag, Settings, LogOut, Sun, Moon, BarChart2, Wallet, LayoutDashboard } from "lucide-react";

const SENHA = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "mp2025";

// mobile: aparece na barra inferior. Configurações fica só no desktop e no ícone do cabeçalho.
const nav = [
  { href: "/admin", label: "Início", icon: LayoutDashboard, mobile: true },
  { href: "/admin/veiculos", label: "Veículos", icon: Car, mobile: true },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet, mobile: true },
  { href: "/admin/marcas", label: "Marcas", icon: Tag, mobile: true },
  { href: "/admin/relatorio", label: "Relatório", icon: BarChart2, mobile: true },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, mobile: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
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
      sessionStorage.setItem("mp_admin_senha", senha);
      setAutenticado(true);
      setErro(false);
    } else {
      setErro(true);
    }
  }

  function sair() {
    sessionStorage.removeItem("mp_admin");
    sessionStorage.removeItem("mp_admin_senha");
    setAutenticado(false);
    router.push("/admin");
  }

  if (autenticado === null) return null;

  if (!autenticado) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Painel esquerdo/topo: dark green + marketing */}
        <div
          className="relative md:w-1/2 flex flex-col justify-between px-8 py-10 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #001208 0%, #002010 50%, #001a0a 100%)",
            minHeight: "clamp(260px, 42vh, 380px)",
          }}
        >
          {/* Orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: "#00B040" }} />
          <div className="absolute -bottom-20 right-0 w-56 h-56 rounded-full blur-3xl opacity-15" style={{ background: "#00cc4d" }} />

          {/* Logo row */}
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/logos/mp/logo-seminovos-bg-green.png"
              alt="MP Seminovos"
              width={38}
              height={38}
              className="rounded-xl shadow-md"
              style={{ width: 38, height: 38 }}
            />
            <span className="font-bold text-white text-sm tracking-widest uppercase">MP Seminovos</span>
          </div>

          {/* Headline */}
          <div className="relative z-10 mt-auto pt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 shrink-0" style={{ background: "#00B040" }} />
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#4ade80" }}>
                Sistema de Gestão
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Controle total<br />
              do seu{" "}
              <span style={{ color: "#4ade80" }}>estoque.</span>
            </h1>
            <p className="text-gray-400 mt-3 text-sm leading-relaxed max-w-xs">
              Gerencie veículos, marcas e configurações em um só lugar, com agilidade.
            </p>
          </div>
        </div>

        {/* Painel direito/baixo: formulário */}
        <div className="flex-1 flex flex-col justify-center bg-white px-8 py-12">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-3xl font-black text-gray-900 mb-1">Entrar no sistema.</h2>
            <p className="text-gray-500 text-sm mb-8">
              Acesse o painel de gestão da MP Seminovos.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-2 text-gray-700">
                  Senha de acesso
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  className="w-full rounded-xl text-gray-900 placeholder-gray-300 px-4 py-3.5 text-base focus:outline-none transition-all"
                  style={{
                    background: "#f9fafb",
                    border: erro ? "2px solid #ef4444" : "2px solid #e5e7eb",
                  }}
                  onFocus={e => { e.currentTarget.style.border = "2px solid #00B040"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={e => { e.currentTarget.style.border = erro ? "2px solid #ef4444" : "2px solid #e5e7eb"; e.currentTarget.style.background = "#f9fafb"; }}
                />
                {erro && <p className="text-red-500 text-xs mt-1.5 font-medium">Senha incorreta. Tente novamente.</p>}
              </div>

              <button
                onClick={login}
                className="w-full text-white font-bold py-4 rounded-xl text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #00B040 0%, #009935 60%, #007a2a 100%)",
                  boxShadow: "0 4px 24px rgba(0,176,64,0.3)",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                ENTRAR NO SISTEMA →
              </button>
            </div>

            {/* SSL badge */}
            <div className="mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span className="text-xs text-gray-500 font-medium">Conexão segura · SSL/TLS</span>
            </div>

            <p className="text-center text-xs mt-8 text-gray-400">
              Feito pela{" "}
              <a href="https://audis.online" target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: "#7c3aed" }}>
                AUDIS
              </a>
            </p>
          </div>
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

        <Link href="/admin/configuracoes" className="md:hidden flex items-center justify-center w-8 h-8" style={{ color: dk.muted }} title="Configurações">
          <Settings size={16} strokeWidth={1.75} />
        </Link>

        <button
          onClick={sair}
          className="flex items-center gap-2 h-8 px-3 rounded-md transition-colors text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: dk.muted }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          Sair
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

        {/* ── Conteúdo ── */}
        <main className="flex-1 md:ml-12 overflow-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Navegação inferior (mobile, estilo Audis) ── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch justify-around"
        style={{ background: dk.surface, borderTop: `1px solid ${dk.border}`, paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {nav.filter(i => i.mobile).map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
              style={{ color: ativo ? "#00B040" : dk.muted }}
            >
              <Icon size={20} strokeWidth={ativo ? 2.25 : 1.75} />
              <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
