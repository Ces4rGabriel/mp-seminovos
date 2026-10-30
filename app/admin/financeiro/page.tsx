"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import ConsultaFipe from "@/components/ConsultaFipe";

type Lancamento = {
  id: string;
  tipo: "entrada" | "saida";
  valor: number | string;
  data: string;
  descricao: string;
  nota_fiscal_url: string | null;
  categorias_financeiras: { nome: string } | null;
  formas_pagamento: { nome: string } | null;
  veiculos: { placa: string | null; marca: string; modelo: string } | null;
};

type Categoria = { id: string; nome: string; tipo: "entrada" | "saida" | "ambos" };
type Forma = { id: string; nome: string };
type VeiculoFin = { veiculo_id: string; placa: string | null; marca: string; modelo: string; ano: number };

type Dados = {
  resumo: { mes: string; saldo: number; entradasMes: number; saidasMes: number; resultadoMes: number };
  estoque: { quantidade: number; capitalInvestido: number; valorVendaPrevisto: number; lucroPrevisto: number; lucroRealizado: number };
  lancamentos: Lancamento[];
  categorias: Categoria[];
  formas: Forma[];
  veiculos: VeiculoFin[];
};

const vazio = {
  tipo: "saida" as "entrada" | "saida",
  valor: "",
  data: new Date().toISOString().slice(0, 10),
  descricao: "",
  categoria_id: "",
  forma_pagamento_id: "",
  veiculo_id: "",
  nota_fiscal_url: "",
};

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatData(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export default function AdminFinanceiro() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  useEffect(() => { carregar(); }, []);

  function cabecalhos(): HeadersInit {
    return { "Content-Type": "application/json", "x-admin-senha": sessionStorage.getItem("mp_admin_senha") ?? "" };
  }

  async function carregar() {
    const res = await fetch("/api/financeiro", { headers: cabecalhos() });
    const json = await res.json();
    if (!res.ok) { setErro(json.erro ?? "Erro ao carregar"); return; }
    setErro("");
    setDados(json);
  }

  async function ver(caminho: string) {
    const res = await fetch(`/api/financeiro/nota?path=${encodeURIComponent(caminho)}`, { headers: cabecalhos() });
    const json = await res.json();
    if (!res.ok) { alert("Erro: " + json.erro); return; }
    window.open(json.url, "_blank", "noopener");
  }

  async function salvar() {
    if (!form.valor || Number(form.valor) <= 0) { alert("Informe um valor maior que zero."); return; }
    if (!form.descricao.trim()) { alert("Informe a descrição."); return; }
    setSalvando(true);

    let notaPath: string | null = null;
    if (arquivo) {
      const envio = new FormData();
      envio.append("arquivo", arquivo);
      const r = await fetch("/api/financeiro/nota", {
        method: "POST",
        headers: { "x-admin-senha": sessionStorage.getItem("mp_admin_senha") ?? "" },
        body: envio,
      });
      const j = await r.json();
      if (!r.ok) { setSalvando(false); alert("Erro no arquivo: " + j.erro); return; }
      notaPath = j.path;
    }

    const res = await fetch("/api/financeiro", {
      method: "POST",
      headers: cabecalhos(),
      body: JSON.stringify({ ...form, valor: Number(form.valor.replace(",", ".")), nota_fiscal_url: notaPath }),
    });
    setSalvando(false);
    const json = await res.json();
    if (!res.ok) { alert("Erro: " + json.erro); return; }
    setForm(vazio);
    setArquivo(null);
    setFormAberto(false);
    carregar();
  }

  const categoriasDoTipo = (dados?.categorias ?? []).filter(c => c.tipo === form.tipo || c.tipo === "ambos");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Caixa da empresa</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-none uppercase tracking-wide">Financeiro</h1>
        </div>
        <button
          onClick={() => setFormAberto(true)}
          className="flex items-center gap-2 text-white text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg cursor-pointer"
          style={{ background: "#00B040" }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Lançamento
        </button>
      </div>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

      {!dados ? (
        !erro && <div className="text-center py-20 text-gray-400">Carregando...</div>
      ) : (
        <>
          {/* Resumo do caixa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl p-4" style={{ background: "#003314" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#4ade80" }}>Saldo do caixa</p>
              <p className="text-xl font-black text-white">{formatBRL(dados.resumo.saldo)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Entradas no mês</p>
              <p className="text-xl font-black text-gray-900">{formatBRL(dados.resumo.entradasMes)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Saídas no mês</p>
              <p className="text-xl font-black text-gray-900">{formatBRL(dados.resumo.saidasMes)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Resultado do mês</p>
              <p className="text-xl font-black" style={{ color: dados.resumo.resultadoMes >= 0 ? "#00B040" : "#ef4444" }}>
                {formatBRL(dados.resumo.resultadoMes)}
              </p>
            </div>
          </div>

          {/* Estoque */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Estoque · {dados.estoque.quantidade} veículos em estoque
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Capital investido</p>
                <p className="font-bold text-gray-900">{formatBRL(dados.estoque.capitalInvestido)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Venda prevista</p>
                <p className="font-bold text-gray-900">{formatBRL(dados.estoque.valorVendaPrevisto)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Lucro previsto</p>
                <p className="font-bold text-gray-900">{formatBRL(dados.estoque.lucroPrevisto)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Lucro realizado</p>
                <p className="font-bold text-gray-900">{formatBRL(dados.estoque.lucroRealizado)}</p>
              </div>
            </div>
          </div>

          <ConsultaFipe veiculos={dados.veiculos} onSalvo={carregar} />

          {/* Lançamentos */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Últimos lançamentos</p>
          {dados.lancamentos.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs uppercase tracking-wider">Nenhum lançamento ainda</div>
          ) : (
            <div className="space-y-2">
              {dados.lancamentos.map(l => (
                <div key={l.id} className="bg-white border border-gray-200 rounded-xl flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">{l.descricao}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5 truncate">
                      {formatData(l.data)}
                      {l.categorias_financeiras && ` · ${l.categorias_financeiras.nome}`}
                      {l.formas_pagamento && ` · ${l.formas_pagamento.nome}`}
                      {l.veiculos && ` · ${l.veiculos.placa ?? ""} ${l.veiculos.marca} ${l.veiculos.modelo}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {l.nota_fiscal_url && (
                      <button onClick={() => ver(l.nota_fiscal_url!)} className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-800">
                        Nota
                      </button>
                    )}
                    <p className="font-bold text-sm" style={{ color: l.tipo === "entrada" ? "#00B040" : "#ef4444" }}>
                      {l.tipo === "entrada" ? "+" : "−"} {formatBRL(Number(l.valor))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Formulário de lançamento */}
      {formAberto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setFormAberto(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4 max-h-[85vh] overflow-auto my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-black text-gray-900 uppercase tracking-wide">Novo lançamento</p>
              <button onClick={() => setFormAberto(false)} className="text-gray-400"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["entrada", "saida"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, tipo: t, categoria_id: "" })}
                  className="py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider border"
                  style={form.tipo === t
                    ? { background: t === "entrada" ? "#00B040" : "#ef4444", color: "#fff", borderColor: "transparent" }
                    : { color: "#6b7280", borderColor: "#e5e7eb" }}
                >
                  {t === "entrada" ? "Entrada" : "Saída"}
                </button>
              ))}
            </div>

            <input
              inputMode="decimal"
              placeholder="Valor (R$)"
              value={form.valor}
              onChange={e => setForm({ ...form, valor: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />
            <input
              type="date"
              value={form.data}
              onChange={e => setForm({ ...form, data: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />
            <input
              placeholder="Descrição (ex.: Calota + insufilme)"
              value={form.descricao}
              onChange={e => setForm({ ...form, descricao: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />

            <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
              <option value="">Categoria</option>
              {categoriasDoTipo.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>

            <select value={form.forma_pagamento_id} onChange={e => setForm({ ...form, forma_pagamento_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
              <option value="">Forma de pagamento</option>
              {(dados?.formas ?? []).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>

            <select value={form.veiculo_id} onChange={e => setForm({ ...form, veiculo_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
              <option value="">Sem veículo</option>
              {(dados?.veiculos ?? []).map(v => (
                <option key={v.veiculo_id} value={v.veiculo_id}>{v.placa ?? "s/ placa"} · {v.marca} {v.modelo} {v.ano}</option>
              ))}
            </select>

            <label className="block border border-dashed border-gray-300 rounded-lg px-3 py-3 text-xs text-gray-500 cursor-pointer">
              {arquivo ? `Nota: ${arquivo.name}` : "Anexar nota fiscal (PDF, JPG, PNG ou WEBP, até 10 MB)"}
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              onClick={salvar}
              disabled={salvando}
              className="w-full text-white text-[11px] font-bold uppercase tracking-wider py-3 rounded-lg disabled:opacity-60"
              style={{ background: "#00B040" }}
            >
              {salvando ? "Salvando..." : "Salvar lançamento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
