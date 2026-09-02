"use client";

import { useState, useEffect } from "react";
import { supabase, type Veiculo } from "@/lib/supabase";
import { X, Upload, Trash2, CheckCircle2, Circle } from "lucide-react";
import Image from "next/image";

const OPCIONAIS_PADRAO = [
  "Ar-condicionado", "Direção elétrica", "Vidros elétricos", "Travas elétricas",
  "Airbag", "ABS", "Central multimídia", "Câmera de ré", "Sensor de estacionamento",
  "Teto solar", "Bancos em couro", "GPS", "Bluetooth", "Rodas de liga leve", "Faróis de neblina",
];

type Props = {
  veiculo: Veiculo | null;
  onFechar: () => void;
  onSalvo: () => void;
};

const vazio = {
  marca: "",
  modelo: "",
  tipo: "Seminovo" as "Seminovo" | "Zero km",
  ano: new Date().getFullYear(),
  km: 0,
  preco: 0,
  fipe_preco: null as number | null,
  cor: "",
  cambio: "Manual" as Veiculo["cambio"],
  combustivel: "Flex" as Veiculo["combustivel"],
  descricao: "",
  opcionais: [] as string[],
  fotos: [] as string[],
  destaque: false,
  vendido: false,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export default function FormVeiculo({ veiculo, onFechar, onSalvo }: Props) {
  const [dados, setDados] = useState(
    veiculo ? { ...veiculo, descricao: veiculo.descricao ?? "" } : vazio
  );
  const [marcas, setMarcas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  useEffect(() => {
    supabase.from("marcas").select("nome").order("nome").then(({ data }) => {
      setMarcas(data?.map((m) => m.nome) ?? []);
    });
  }, []);

  function set<K extends keyof typeof vazio>(chave: K, valor: (typeof vazio)[K]) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  function toggleOpcional(op: string) {
    setDados((d) => ({
      ...d,
      opcionais: d.opcionais.includes(op)
        ? d.opcionais.filter((o) => o !== op)
        : [...d.opcionais, op],
    }));
  }

  async function uploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoFoto(true);
    const ext = arquivo.name.split(".").pop();
    const nome = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("veiculos")
      .upload(nome, arquivo, { contentType: arquivo.type });
    if (error) { alert("Erro ao fazer upload: " + error.message); setEnviandoFoto(false); return; }
    const { data: urlData } = supabase.storage.from("veiculos").getPublicUrl(data.path);
    setDados((d) => ({ ...d, fotos: [...d.fotos, urlData.publicUrl] }));
    setEnviandoFoto(false);
    e.target.value = "";
  }

  function removerFoto(url: string) {
    setDados((d) => ({ ...d, fotos: d.fotos.filter((f) => f !== url) }));
  }

  async function salvar() {
    if (!dados.marca || !dados.modelo || !dados.preco) {
      alert("Preencha marca, modelo e preço.");
      return;
    }
    setSalvando(true);
    const payload = { ...dados, descricao: dados.descricao || null };
    if (veiculo) {
      await supabase.from("veiculos").update(payload).eq("id", veiculo.id);
    } else {
      await supabase.from("veiculos").insert(payload);
    }
    setSalvando(false);
    onSalvo();
  }

  const inp = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl max-h-[95dvh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
              {veiculo ? "Editar cadastro" : "Novo cadastro"}
            </p>
            <h2 className="font-black text-gray-900 text-lg leading-none">
              {veiculo ? `${veiculo.marca} ${veiculo.modelo}` : "Veículo"}
            </h2>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Identificação */}
          <section>
            <SectionLabel>Identificação</SectionLabel>

            {/* Tipo: Seminovo / Zero km */}
            <div className="flex gap-2 mb-4">
              {(["Seminovo", "Zero km"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("tipo", t)}
                  className="flex-1 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  style={
                    dados.tipo === t
                      ? { background: "#003314", borderColor: "#003314", color: "#fff" }
                      : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#6b7280" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Marca *</label>
                <select value={dados.marca} onChange={(e) => set("marca", e.target.value)} className={inp}>
                  <option value="">Selecionar</option>
                  {marcas.length > 0
                    ? marcas.map((m) => <option key={m} value={m}>{m}</option>)
                    : <option disabled>Cadastre marcas primeiro</option>
                  }
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Modelo *</label>
                <input type="text" value={dados.modelo} onChange={(e) => set("modelo", e.target.value)} className={inp} placeholder="Ex: Onix Plus LT" />
              </div>
            </div>
          </section>

          {/* Dados técnicos */}
          <section>
            <SectionLabel>Dados técnicos</SectionLabel>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Ano</label>
                <input type="number" value={dados.ano} onChange={(e) => set("ano", Number(e.target.value))} className={inp} />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  {dados.tipo === "Zero km" ? "KM (0)" : "KM"}
                </label>
                <input
                  type="number"
                  value={dados.tipo === "Zero km" ? 0 : dados.km}
                  onChange={(e) => set("km", Number(e.target.value))}
                  className={inp}
                  disabled={dados.tipo === "Zero km"}
                  style={dados.tipo === "Zero km" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Preço *</label>
                <input type="number" value={dados.preco} onChange={(e) => set("preco", Number(e.target.value))} className={inp} />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Preço FIPE</label>
                <input type="number" value={dados.fipe_preco ?? ""} onChange={(e) => set("fipe_preco", e.target.value ? Number(e.target.value) : null)} className={inp} placeholder="Opcional" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Cor</label>
                <input type="text" value={dados.cor} onChange={(e) => set("cor", e.target.value)} className={inp} placeholder="Ex: Prata" />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Câmbio</label>
                <select value={dados.cambio} onChange={(e) => set("cambio", e.target.value as typeof dados.cambio)} className={inp}>
                  <option>Manual</option>
                  <option>Automático</option>
                  <option>CVT</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Combustível</label>
                <select value={dados.combustivel} onChange={(e) => set("combustivel", e.target.value as typeof dados.combustivel)} className={inp}>
                  <option>Flex</option>
                  <option>Gasolina</option>
                  <option>Diesel</option>
                  <option>Elétrico</option>
                  <option>Híbrido</option>
                </select>
              </div>
            </div>
          </section>

          {/* Descrição */}
          <section>
            <SectionLabel>Descrição</SectionLabel>
            <textarea
              rows={3}
              value={dados.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              className={inp + " resize-none"}
              placeholder="Informações adicionais sobre o veículo..."
            />
          </section>

          {/* Fotos */}
          <section>
            <SectionLabel>Fotos</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {dados.fotos.map((url, i) => (
                <div key={url} className="relative w-24 h-20 rounded-xl overflow-hidden group border border-gray-200 shrink-0">
                  <Image src={url} alt={`foto ${i + 1}`} fill className="object-cover" sizes="96px" />
                  <button
                    onClick={() => removerFoto(url)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  >
                    <Trash2 size={16} className="text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white px-1.5 py-0.5 rounded">
                      Capa
                    </span>
                  )}
                </div>
              ))}
              <label className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 flex flex-col items-center justify-center transition-all shrink-0 gap-1 cursor-pointer">
                {enviandoFoto ? (
                  <span className="text-[10px] text-gray-400">Enviando...</span>
                ) : (
                  <>
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-semibold">Adicionar</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={uploadFoto} disabled={enviandoFoto} />
              </label>
            </div>
            {dados.fotos.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-2">A primeira foto será usada como capa.</p>
            )}
          </section>

          {/* Opcionais */}
          <section>
            <SectionLabel>Opcionais</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {OPCIONAIS_PADRAO.map((op) => {
                const ativo = dados.opcionais.includes(op);
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => toggleOpcional(op)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer"
                    style={
                      ativo
                        ? { background: "#dcfce7", borderColor: "#86efac", color: "#003314" }
                        : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#6b7280" }
                    }
                  >
                    {ativo
                      ? <CheckCircle2 size={12} style={{ color: "#00B040" }} />
                      : <Circle size={12} style={{ color: "#d1d5db" }} />
                    }
                    <span className="font-semibold">{op}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Configurações */}
          <section>
            <SectionLabel>Configurações</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <label
                className="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer"
                style={dados.destaque
                  ? { borderColor: "#86efac", background: "#f0fdf4" }
                  : { borderColor: "#e5e7eb", background: "#f9fafb" }
                }
              >
                <input type="checkbox" checked={dados.destaque} onChange={(e) => set("destaque", e.target.checked)} className="sr-only" />
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={dados.destaque ? { borderColor: "#00B040", background: "#00B040" } : { borderColor: "#d1d5db" }}>
                  {dados.destaque && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">Destaque</p>
                  <p className="text-[10px] text-gray-400">Aparece no topo do site</p>
                </div>
              </label>

              <label
                className="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer"
                style={dados.vendido
                  ? { borderColor: "#fca5a5", background: "#fff5f5" }
                  : { borderColor: "#e5e7eb", background: "#f9fafb" }
                }
              >
                <input type="checkbox" checked={dados.vendido} onChange={(e) => set("vendido", e.target.checked)} className="sr-only" />
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={dados.vendido ? { borderColor: "#ef4444", background: "#ef4444" } : { borderColor: "#d1d5db" }}>
                  {dados.vendido && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">Vendido</p>
                  <p className="text-[10px] text-gray-400">Oculta do estoque ativo</p>
                </div>
              </label>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex gap-3 bg-white">
          <button
            onClick={onFechar}
            className="flex-1 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 font-semibold py-2.5 rounded-xl transition-colors text-[11px] uppercase tracking-wider cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 text-white font-bold py-2.5 rounded-xl transition-colors text-[11px] uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            style={{ background: "#00B040" }}
            onMouseEnter={e => { if (!salvando) e.currentTarget.style.background = "#009935"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#00B040"; }}
          >
            {salvando ? "Salvando..." : veiculo ? "Salvar alterações" : "Cadastrar veículo"}
          </button>
        </div>
      </div>
    </div>
  );
}
