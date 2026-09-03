"use client";

import { useState, useEffect } from "react";
import { supabase, type Veiculo } from "@/lib/supabase";
import { Plus, Trash2, Edit3, Eye, EyeOff, BadgeCheck, Car } from "lucide-react";
import FormVeiculo from "@/components/FormVeiculo";
import Image from "next/image";

function formatPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function AdminVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Veiculo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "disponiveis" | "vendidos">("todos");

  useEffect(() => { carregarVeiculos(); }, []);

  async function carregarVeiculos() {
    setCarregando(true);
    const { data } = await supabase.from("veiculos").select("*").order("created_at", { ascending: false });
    setVeiculos(data ?? []);
    setCarregando(false);
  }

  async function toggleOculto(v: Veiculo) {
    const { error } = await supabase.from("veiculos").update({ oculto: !v.oculto }).eq("id", v.id);
    if (error) { alert("Erro: " + error.message); return; }
    carregarVeiculos();
  }

  async function toggleVendido(v: Veiculo) {
    const agora = new Date().toISOString();
    const patch = v.vendido
      ? { vendido: false, vendido_em: null }
      : { vendido: true, vendido_em: agora };
    const { error } = await supabase.from("veiculos").update(patch).eq("id", v.id);
    if (error) { alert("Erro: " + error.message); return; }
    carregarVeiculos();
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este veículo?")) return;
    const { error } = await supabase.from("veiculos").delete().eq("id", id);
    if (error) { alert("Erro ao excluir: " + error.message); return; }
    carregarVeiculos();
  }

  const filtrados = veiculos.filter(v =>
    filtro === "todos" ? true : filtro === "vendidos" ? v.vendido : !v.vendido
  );

  const stats = {
    total: veiculos.length,
    disponiveis: veiculos.filter(v => !v.vendido).length,
    vendidos: veiculos.filter(v => v.vendido).length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Estoque · Visão Geral</p>
          <h1 className="text-3xl font-black text-gray-900 leading-none uppercase tracking-wide">Veículos</h1>
        </div>
        <button
          onClick={() => { setEditando(null); setFormAberto(true); }}
          className="flex items-center gap-2 text-white text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg cursor-pointer"
          style={{ background: "#00B040" }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Novo Veículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Total</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#003314" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#4ade80" }}>Disponíveis</p>
          <p className="text-3xl font-black text-white">{stats.disponiveis}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Vendidos</p>
          <p className="text-3xl font-black text-gray-400">{stats.vendidos}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {(["todos", "disponiveis", "vendidos"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filtro === f ? "text-white" : "text-gray-500 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
            style={filtro === f ? { background: "#003314" } : {}}
          >
            {f === "todos" ? "Todos" : f === "disponiveis" ? "Disponíveis" : "Vendidos"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="text-center py-20 text-gray-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <Car size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Nenhum veículo encontrado</p>
          <button
            onClick={() => { setEditando(null); setFormAberto(true); }}
            className="mt-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
            style={{ color: "#00B040" }}
          >
            Cadastrar agora →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((v) => (
            <div
              key={v.id}
              className={`bg-white border rounded-xl flex items-center gap-4 p-4 transition-opacity ${
                v.vendido ? "border-gray-100 opacity-60" : "border-gray-200"
              }`}
            >
              {/* Miniatura */}
              <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {v.fotos?.[0] ? (
                  <Image src={v.fotos[0]} alt={v.modelo} width={64} height={48} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car size={20} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm">{v.marca} {v.modelo} {v.ano}</p>
                  {v.destaque && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#dcfce7", color: "#003314" }}>
                      Destaque
                    </span>
                  )}
                  {v.oculto && !v.vendido && (
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Oculto</span>
                  )}
                  {v.vendido && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Vendido</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-0.5">
                  {formatPreco(v.preco)} · {v.km.toLocaleString("pt-BR")} km · {v.cor}
                </p>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleOculto(v)}
                  title={v.oculto ? "Mostrar no site" : "Ocultar do site"}
                  className="p-2 transition-colors cursor-pointer"
                  style={{ color: v.oculto ? "#f59e0b" : "#9ca3af" }}
                >
                  {v.oculto ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => toggleVendido(v)}
                  title={v.vendido ? "Desmarcar vendido" : "Marcar como vendido"}
                  className="p-2 transition-colors cursor-pointer"
                  style={{ color: v.vendido ? "#00B040" : "#9ca3af" }}
                >
                  <BadgeCheck size={16} />
                </button>
                <button
                  onClick={() => { setEditando(v); setFormAberto(true); }}
                  className="p-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => excluir(v.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formAberto && (
        <FormVeiculo
          veiculo={editando}
          onFechar={() => { setFormAberto(false); setEditando(null); }}
          onSalvo={() => { setFormAberto(false); setEditando(null); carregarVeiculos(); }}
        />
      )}
    </div>
  );
}
