"use client";

import { useEffect, useState } from "react";

type Opcao = { codigo: string | number; nome: string };
type Preco = {
  valor: number;
  valorTexto: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
};
type VeiculoOpcao = { veiculo_id: string; placa: string | null; marca: string; modelo: string; ano: number };

function cabecalhos(): HeadersInit {
  return { "Content-Type": "application/json", "x-admin-senha": sessionStorage.getItem("mp_admin_senha") ?? "" };
}

export default function ConsultaFipe({ veiculos, onSalvo }: { veiculos: VeiculoOpcao[]; onSalvo: () => void }) {
  const [marcas, setMarcas] = useState<Opcao[]>([]);
  const [modelos, setModelos] = useState<Opcao[]>([]);
  const [anos, setAnos] = useState<Opcao[]>([]);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [preco, setPreco] = useState<Preco | null>(null);
  const [veiculoId, setVeiculoId] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/fipe?etapa=marcas", { headers: cabecalhos() })
      .then(r => r.json())
      .then(d => setMarcas(Array.isArray(d) ? d : []))
      .catch(() => setErro("Não foi possível carregar as marcas da FIPE."));
  }, []);

  async function escolherMarca(codigo: string) {
    setMarca(codigo); setModelo(""); setAno(""); setPreco(null); setModelos([]); setAnos([]);
    if (!codigo) return;
    setCarregando(true);
    const r = await fetch(`/api/fipe?etapa=modelos&marca=${codigo}`, { headers: cabecalhos() });
    setModelos(await r.json());
    setCarregando(false);
  }

  async function escolherModelo(codigo: string) {
    setModelo(codigo); setAno(""); setPreco(null); setAnos([]);
    if (!codigo) return;
    setCarregando(true);
    const r = await fetch(`/api/fipe?etapa=anos&marca=${marca}&modelo=${codigo}`, { headers: cabecalhos() });
    setAnos(await r.json());
    setCarregando(false);
  }

  async function escolherAno(codigo: string) {
    setAno(codigo); setPreco(null);
    if (!codigo) return;
    setCarregando(true);
    const r = await fetch(`/api/fipe?etapa=preco&marca=${marca}&modelo=${modelo}&ano=${codigo}`, { headers: cabecalhos() });
    const d = await r.json();
    setCarregando(false);
    if (!r.ok) { setErro(d.erro ?? "Erro na consulta"); return; }
    setErro("");
    setPreco(d);
  }

  async function salvar() {
    if (!preco || !veiculoId) return;
    const r = await fetch("/api/financeiro/fipe", {
      method: "POST",
      headers: cabecalhos(),
      body: JSON.stringify({ veiculo_id: veiculoId, codigo_fipe: preco.codigoFipe, valor: preco.valor }),
    });
    const d = await r.json();
    if (!r.ok) { alert("Erro: " + d.erro); return; }
    alert("Valor FIPE salvo no veículo.");
    onSalvo();
  }

  const selectCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white disabled:opacity-50";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Consulta FIPE (valor de mercado)</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <select value={marca} onChange={e => escolherMarca(e.target.value)} className={selectCls}>
          <option value="">Marca</option>
          {marcas.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
        </select>
        <select value={modelo} onChange={e => escolherModelo(e.target.value)} disabled={!modelos.length} className={selectCls}>
          <option value="">Modelo</option>
          {modelos.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
        </select>
        <select value={ano} onChange={e => escolherAno(e.target.value)} disabled={!anos.length} className={selectCls}>
          <option value="">Ano</option>
          {anos.map(a => <option key={a.codigo} value={a.codigo}>{a.nome}</option>)}
        </select>
      </div>

      {carregando && <p className="text-xs text-gray-400">Consultando...</p>}
      {erro && <p className="text-xs text-red-500">{erro}</p>}

      {preco && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{preco.marca} {preco.modelo} · {preco.anoModelo} · {preco.combustivel}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{preco.valorTexto}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Referência: {preco.mesReferencia} · Código FIPE {preco.codigoFipe}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            <select value={veiculoId} onChange={e => setVeiculoId(e.target.value)} className={selectCls}>
              <option value="">Salvar em qual veículo?</option>
              {veiculos.map(v => (
                <option key={v.veiculo_id} value={v.veiculo_id}>{v.placa ?? "s/ placa"} · {v.marca} {v.modelo} {v.ano}</option>
              ))}
            </select>
            <button
              onClick={salvar}
              disabled={!veiculoId}
              className="text-white text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg disabled:opacity-40"
              style={{ background: "#00B040" }}
            >
              Salvar valor no veículo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
