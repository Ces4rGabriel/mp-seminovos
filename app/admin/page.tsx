"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Wallet, BarChart2, Tag } from "lucide-react";

type Dados = {
  resumo: { saldo: number; resultadoMes: number; entradasMes: number; saidasMes: number };
  estoque: { quantidade: number; capitalInvestido: number; lucroPrevisto: number; lucroRealizado: number };
  lancamentos: { id: string; tipo: "entrada" | "saida"; valor: number | string; data: string; descricao: string }[];
  veiculos: { vendido: boolean; valor_recebido: number }[];
};

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatData(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const atalhos = [
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/veiculos", label: "Veículos", icon: Car },
  { href: "/admin/relatorio", label: "Relatório", icon: BarChart2 },
  { href: "/admin/marcas", label: "Marcas", icon: Tag },
];

export default function AdminInicio() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/financeiro", { headers: { "x-admin-senha": sessionStorage.getItem("mp_admin_senha") ?? "" } })
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => (ok ? setDados(j) : setErro(j.erro ?? "Erro ao carregar")))
      .catch(() => setErro("Erro ao carregar"));
  }, []);

  const vendidos = dados?.veiculos.filter(v => v.vendido) ?? [];
  const recebidoVendas = vendidos.reduce((s, v) => s + Number(v.valor_recebido), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Visão geral</p>
        <h1 className="text-3xl font-black text-gray-900 leading-none uppercase tracking-wide">Dashboard</h1>
      </div>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
      {!dados && !erro && <div className="text-center py-20 text-gray-400">Carregando...</div>}

      {dados && (
        <>
          {/* Caixa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl p-4" style={{ background: "#003314" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#4ade80" }}>Saldo do caixa</p>
              <p className="text-[15px] md:text-xl font-black whitespace-nowrap text-white">{formatBRL(dados.resumo.saldo)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Entradas no mês</p>
              <p className="text-[15px] md:text-xl font-black whitespace-nowrap text-gray-900">{formatBRL(dados.resumo.entradasMes)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Saídas no mês</p>
              <p className="text-[15px] md:text-xl font-black whitespace-nowrap text-gray-900">{formatBRL(dados.resumo.saidasMes)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Resultado do mês</p>
              <p className="text-[15px] md:text-xl font-black whitespace-nowrap" style={{ color: dados.resumo.resultadoMes >= 0 ? "#00B040" : "#ef4444" }}>
                {formatBRL(dados.resumo.resultadoMes)}
              </p>
            </div>
          </div>

          {/* Estoque e vendas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Estoque · {dados.estoque.quantidade} veículos
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Capital investido</p>
                  <p className="font-bold text-gray-900">{formatBRL(dados.estoque.capitalInvestido)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Lucro previsto</p>
                  <p className="font-bold text-gray-900">{formatBRL(dados.estoque.lucroPrevisto)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Vendas · {vendidos.length} veículos vendidos
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Recebido nas vendas</p>
                  <p className="font-bold text-gray-900">{formatBRL(recebidoVendas)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Lucro realizado</p>
                  <p className="font-bold text-gray-900">{formatBRL(dados.estoque.lucroRealizado)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Atalhos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {atalhos.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-gray-300 transition-colors">
                <Icon size={18} style={{ color: "#00B040" }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700">{label}</span>
              </Link>
            ))}
          </div>

          {/* Últimos lançamentos */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Últimos lançamentos</p>
          {dados.lancamentos.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs uppercase tracking-wider">Nenhum lançamento ainda</div>
          ) : (
            <div className="space-y-2">
              {dados.lancamentos.slice(0, 5).map(l => (
                <div key={l.id} className="bg-white border border-gray-200 rounded-xl flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">{l.descricao}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{formatData(l.data)}</p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: l.tipo === "entrada" ? "#00B040" : "#ef4444" }}>
                    {l.tipo === "entrada" ? "+" : "−"} {formatBRL(Number(l.valor))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
