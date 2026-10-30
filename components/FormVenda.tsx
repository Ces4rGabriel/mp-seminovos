"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { Veiculo } from "@/lib/supabase";

type Forma = { id: string; nome: string };
type Troca = { valor: string; marca: string; modelo: string; ano: string; placa: string; km: string; cor: string; cambio: string };
type Pagamento = { forma_id: string; valor: string; data: string };

function cabecalhos(): HeadersInit {
  return { "Content-Type": "application/json", "x-admin-senha": sessionStorage.getItem("mp_admin_senha") ?? "" };
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

const trocaVazia: Troca = { valor: "", marca: "", modelo: "", ano: "", placa: "", km: "", cor: "", cambio: "Manual" };

export default function FormVenda({ veiculo, custo, onFechar, onSalvo }: {
  veiculo: Pick<Veiculo, "id" | "marca" | "modelo" | "ano"> & { placa?: string | null };
  custo: number;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const [formas, setFormas] = useState<Forma[]>([]);
  const [valorVenda, setValorVenda] = useState("");
  const [data, setData] = useState(hojeIso());
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/financeiro", { headers: cabecalhos() })
      .then(r => r.json())
      .then(d => setFormas((d.formas ?? []).filter((f: Forma & { nome: string }) => f.nome !== "Troca")));
  }, []);

  const venda = Number(valorVenda) || 0;
  const somaTrocas = trocas.reduce((s, t) => s + (Number(t.valor) || 0), 0);
  const somaPagamentos = pagamentos.reduce((s, p) => s + (Number(p.valor) || 0), 0);
  const recebido = somaTrocas + somaPagamentos;
  const diferenca = venda - recebido;
  const lucro = venda - custo;

  function atualizarTroca(i: number, campo: keyof Troca, valor: string) {
    setTrocas(ts => ts.map((t, idx) => (idx === i ? { ...t, [campo]: valor } : t)));
  }

  function atualizarPagamento(i: number, campo: keyof Pagamento, valor: string) {
    setPagamentos(ps => ps.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));
  }

  async function salvar() {
    setSalvando(true);
    const r = await fetch("/api/financeiro/venda", {
      method: "POST",
      headers: cabecalhos(),
      body: JSON.stringify({
        veiculo_id: veiculo.id,
        valor_venda: venda,
        data,
        trocas: trocas.map(t => ({
          valor: Number(t.valor),
          veiculo: { marca: t.marca, modelo: t.modelo, ano: Number(t.ano), placa: t.placa, km: Number(t.km), cor: t.cor, cambio: t.cambio, combustivel: "Flex" },
        })),
        pagamentos: pagamentos.map(p => ({ forma_id: p.forma_id, valor: Number(p.valor), data: p.data || data })),
      }),
    });
    const d = await r.json();
    setSalvando(false);
    if (!r.ok) { alert("Erro: " + d.erro); return; }
    onSalvo();
  }

  const input = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white";
  const label = "text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1";
  const podeSalvar = venda > 0 && diferenca <= 0 && !salvando;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Venda</p>
            <p className="font-bold text-gray-900 text-sm">{veiculo.marca} {veiculo.modelo} {veiculo.ano} · {veiculo.placa ?? "s/ placa"}</p>
          </div>
          <button onClick={onFechar} className="p-1.5 text-gray-400 hover:text-gray-700"><X size={16} /></button>
        </div>

        <div className="p-4 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Valor combinado do veículo</label>
              <input className={input} inputMode="decimal" placeholder="0,00" value={valorVenda} onChange={e => setValorVenda(e.target.value)} />
            </div>
            <div>
              <label className={label}>Data da venda</label>
              <input className={input} type="date" value={data} onChange={e => setData(e.target.value)} />
            </div>
          </div>

          {/* Trocas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className={label + " mb-0"}>Carro recebido na troca</p>
              <button onClick={() => setTrocas(ts => [...ts, { ...trocaVazia }])} className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: "#00B040" }}>
                <Plus size={12} /> Adicionar troca
              </button>
            </div>
            {trocas.map((t, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 mb-2 space-y-2">
                <div className="flex gap-2">
                  <input className={input} placeholder="Valor da avaliação" inputMode="decimal" value={t.valor} onChange={e => atualizarTroca(i, "valor", e.target.value)} />
                  <button onClick={() => setTrocas(ts => ts.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className={input} placeholder="Marca" value={t.marca} onChange={e => atualizarTroca(i, "marca", e.target.value)} />
                  <input className={input} placeholder="Modelo" value={t.modelo} onChange={e => atualizarTroca(i, "modelo", e.target.value)} />
                  <input className={input} placeholder="Ano" inputMode="numeric" value={t.ano} onChange={e => atualizarTroca(i, "ano", e.target.value)} />
                  <input className={input} placeholder="Placa" value={t.placa} onChange={e => atualizarTroca(i, "placa", e.target.value.toUpperCase())} />
                  <input className={input} placeholder="KM" inputMode="numeric" value={t.km} onChange={e => atualizarTroca(i, "km", e.target.value)} />
                  <input className={input} placeholder="Cor" value={t.cor} onChange={e => atualizarTroca(i, "cor", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagamentos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className={label + " mb-0"}>Pagamentos recebidos</p>
              <button onClick={() => setPagamentos(ps => [...ps, { forma_id: "", valor: "", data }])} className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: "#00B040" }}>
                <Plus size={12} /> Adicionar pagamento
              </button>
            </div>
            {pagamentos.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                <select className={input} value={p.forma_id} onChange={e => atualizarPagamento(i, "forma_id", e.target.value)}>
                  <option value="">Forma</option>
                  {formas.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
                <input className={input} placeholder="Valor" inputMode="decimal" value={p.valor} onChange={e => atualizarPagamento(i, "valor", e.target.value)} />
                <button onClick={() => setPagamentos(ps => ps.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="rounded-xl bg-gray-50 p-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Recebido</span><span className="font-semibold">{formatBRL(recebido)}</span></div>
            {diferenca > 0 && <div className="flex justify-between text-red-500"><span>Falta cobrar</span><span className="font-semibold">{formatBRL(diferenca)}</span></div>}
            {diferenca < 0 && <div className="flex justify-between text-amber-600"><span>Devolver ao cliente</span><span className="font-semibold">{formatBRL(-diferenca)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Custo do veículo + gastos</span><span className="font-semibold">{formatBRL(custo)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5"><span className="text-gray-500">Lucro desta venda</span><span className="font-black" style={{ color: lucro >= 0 ? "#00B040" : "#ef4444" }}>{formatBRL(lucro)}</span></div>
          </div>

          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="w-full text-white font-semibold text-[11px] uppercase tracking-wider py-3 rounded-lg disabled:opacity-40"
            style={{ background: "#00B040" }}
          >
            {salvando ? "Salvando..." : "Registrar venda"}
          </button>
        </div>
      </div>
    </div>
  );
}
