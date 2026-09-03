"use client";

import { useState, useEffect } from "react";
import { supabase, type Veiculo } from "@/lib/supabase";
import { TrendingUp, Car, DollarSign, BarChart2 } from "lucide-react";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function mesLabel(date: Date) {
  return date.toLocaleString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
}

type MesData = { label: string; count: number; receita: number };

export default function Relatorio() {
  const [vendidos, setVendidos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("veiculos")
        .select("*")
        .eq("vendido", true)
        .order("vendido_em", { ascending: false });
      setVendidos(data ?? []);
      setCarregando(false);
    }
    carregar();
  }, []);

  // Últimos 6 meses
  const hoje = new Date();
  const meses: MesData[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    return { label: mesLabel(d), count: 0, receita: 0, _year: d.getFullYear(), _month: d.getMonth() } as MesData & { _year: number; _month: number };
  }) as (MesData & { _year: number; _month: number })[];

  vendidos.forEach((v) => {
    if (!v.vendido_em) return;
    const d = new Date(v.vendido_em);
    const m = meses.find((x) => x._year === d.getFullYear() && x._month === d.getMonth());
    if (m) { m.count += 1; m.receita += v.preco; }
  });

  // Stats do mês atual
  const mesAtual = meses[5];
  const totalGeral = vendidos.reduce((s, v) => s + v.preco, 0);
  const ticketMedio = vendidos.length > 0 ? totalGeral / vendidos.length : 0;

  const maxReceita = Math.max(...meses.map((m) => m.receita), 1);

  if (carregando) {
    return <div className="p-6 text-center py-20 text-gray-400">Carregando...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Análise · Vendas</p>
        <h1 className="text-3xl font-black text-gray-900 leading-none uppercase tracking-wide">Relatório</h1>
      </div>

      {/* Cards do mês */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Vendas este mês</p>
            <Car size={16} className="text-gray-300" />
          </div>
          <p className="text-4xl font-black text-gray-900">{mesAtual.count}</p>
          <p className="text-xs text-gray-400 mt-1">veículos</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: "#003314" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#4ade80" }}>Receita este mês</p>
            <DollarSign size={16} style={{ color: "#4ade80" }} />
          </div>
          <p className="text-3xl font-black text-white leading-tight">{fmt(mesAtual.receita)}</p>
          <p className="text-xs mt-1" style={{ color: "#4ade80" }}>em vendas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ticket médio geral</p>
            <TrendingUp size={16} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900 leading-tight">{fmt(ticketMedio)}</p>
          <p className="text-xs text-gray-400 mt-1">{vendidos.length} vendas no total</p>
        </div>
      </div>

      {/* Gráfico de barras: últimos 6 meses */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 size={16} className="text-gray-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Receita — últimos 6 meses</p>
        </div>
        <div className="flex items-end gap-3 h-40">
          {meses.map((m) => {
            const pct = maxReceita > 0 ? (m.receita / maxReceita) * 100 : 0;
            const isAtual = m.label === mesAtual.label;
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
                  {m.receita > 0 && (
                    <p className="text-[9px] text-center text-gray-400 font-medium mb-1 leading-tight">
                      {m.count}v
                    </p>
                  )}
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(pct, m.receita > 0 ? 4 : 0)}%`,
                      background: isAtual ? "#00B040" : "#d1fae5",
                      minHeight: m.receita > 0 ? "8px" : "0",
                    }}
                  />
                </div>
                <p className={`text-[10px] font-bold ${isAtual ? "text-gray-700" : "text-gray-400"}`}>{m.label}</p>
              </div>
            );
          })}
        </div>
        {vendidos.filter(v => v.vendido_em).length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            As vendas marcadas a partir de agora aparecerão aqui automaticamente.
          </p>
        )}
      </div>

      {/* Lista de últimas vendas */}
      {vendidos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Últimas vendas</p>
          <div className="space-y-3">
            {vendidos.slice(0, 10).map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">{v.marca} {v.modelo} {v.ano}</p>
                  <p className="text-xs text-gray-400">
                    {v.vendido_em
                      ? new Date(v.vendido_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                      : "Data não registrada"}
                  </p>
                </div>
                <p className="text-sm font-black text-gray-900">{fmt(v.preco)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
