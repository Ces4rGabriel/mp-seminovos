"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Pencil, Check, X, Store, Phone, MapPin, Clock, Instagram, Facebook, Search, Loader2 } from "lucide-react";

const MapaPicker = dynamic(() => import("@/components/MapaPicker"), { ssr: false });

type Config = {
  id?: string;
  nome_loja: string;
  whatsapp: string;
  endereco: string;
  horario: string;
  instagram: string;
  facebook: string;
};

const vazio: Config = {
  nome_loja: "MP Seminovos",
  whatsapp: "",
  endereco: "",
  horario: "",
  instagram: "",
  facebook: "",
};

type CampoSimples = "nome_loja" | "whatsapp" | "horario" | "instagram" | "facebook";

const camposSimples: {
  key: CampoSimples;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  prefix?: string;
}[] = [
  { key: "nome_loja",  label: "Nome da loja",             placeholder: "MP Seminovos",                    icon: Store },
  { key: "whatsapp",   label: "WhatsApp (DDI+DDD+número)", placeholder: "5531999999999",                   icon: Phone, prefix: "+" },
  { key: "horario",    label: "Horário de atendimento",    placeholder: "Seg a Sex: 8h–18h · Sáb: 8h–13h", icon: Clock },
  { key: "instagram",  label: "Instagram (@ ou URL)",      placeholder: "@mpseminovos",                    icon: Instagram },
  { key: "facebook",   label: "Facebook (@ ou URL)",       placeholder: "facebook.com/mpseminovos",        icon: Facebook },
];

export default function AdminConfiguracoes() {
  const [config, setConfig]         = useState<Config>(vazio);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando]     = useState<CampoSimples | null>(null);
  const [rascunho, setRascunho]     = useState("");
  const [salvando, setSalvando]     = useState(false);

  // Endereço
  const [editandoEnd, setEditandoEnd] = useState(false);
  const [rascunhoEnd, setRascunhoEnd] = useState("");
  const [cep, setCep]                 = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [mapaAberto, setMapaAberto]   = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();
    if (data) setConfig(data);
    setCarregando(false);
  }

  async function salvarCampo(key: string, valor: string) {
    setSalvando(true);
    const novoConfig = { ...config, [key]: valor };
    if (config.id) {
      await supabase.from("configuracoes").update({ [key]: valor }).eq("id", config.id);
    } else {
      const { data } = await supabase.from("configuracoes").insert({ ...vazio, ...novoConfig }).select().single();
      if (data) { setConfig(data); setSalvando(false); return; }
    }
    setConfig(novoConfig);
    setSalvando(false);
  }

  function abrirEdicao(key: CampoSimples) {
    setEditando(key);
    setRascunho(config[key]);
  }

  async function confirmarCampoSimples() {
    if (!editando) return;
    const valor = editando === "whatsapp" ? rascunho.replace(/\D/g, "") : rascunho.trim();
    await salvarCampo(editando, valor);
    setEditando(null);
  }

  async function buscarCep(valor: string) {
    const limpo = valor.replace(/\D/g, "");
    setCep(valor);
    if (limpo.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        const formatado = [
          data.logradouro,
          data.bairro,
          `${data.localidade} - ${data.uf}`,
          `CEP: ${data.cep}`,
        ].filter(Boolean).join(", ");
        setRascunhoEnd(formatado);
      }
    } catch { /* ignore */ } finally {
      setBuscandoCep(false);
    }
  }

  async function confirmarEndereco() {
    await salvarCampo("endereco", rascunhoEnd.trim());
    setEditandoEnd(false);
    setCep("");
  }

  if (carregando) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center py-20">Carregando...</p>
      </div>
    );
  }

  const inp = "w-full bg-gray-50 border border-green-400 text-gray-900 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200";

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin · Loja</p>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-none uppercase tracking-wide">
          Configurações
        </h1>
      </div>

      <div className="space-y-3">

        {/* Campos simples com lápis */}
        {camposSimples.map(({ key, label, placeholder, icon: Icon, prefix }) => {
          const valor = config[key];
          const emEdicao = editando === key;

          return (
            <div key={key} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#003314" }}>
                  <Icon size={13} className="text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
              </div>

              {emEdicao ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative flex-1">
                    {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">{prefix}</span>}
                    <input
                      autoFocus
                      type="text"
                      value={rascunho}
                      onChange={e => setRascunho(key === "whatsapp" ? e.target.value.replace(/\D/g, "") : e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") confirmarCampoSimples(); if (e.key === "Escape") setEditando(null); }}
                      placeholder={placeholder}
                      maxLength={key === "whatsapp" ? 15 : undefined}
                      className={inp + (prefix ? " pl-7" : "")}
                    />
                  </div>
                  <button onClick={confirmarCampoSimples} disabled={salvando}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 disabled:opacity-50 cursor-pointer"
                    style={{ background: "#00B040" }}>
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setEditando(null)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 mt-1">
                  <p className={`text-sm flex-1 truncate ${valor ? "text-gray-800 font-medium" : "text-gray-400 italic"}`}>
                    {key === "whatsapp" && valor ? `+${valor}` : (valor || placeholder)}
                  </p>
                  <button onClick={() => abrirEdicao(key)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 shrink-0 cursor-pointer transition-colors">
                    <Pencil size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Campo endereço — especial */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#003314" }}>
              <MapPin size={13} className="text-white" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Endereço</p>
          </div>

          {editandoEnd ? (
            <div className="flex flex-col gap-2 mt-1">
              {/* CEP */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={cep}
                    onChange={e => buscarCep(e.target.value)}
                    placeholder="CEP (só números)"
                    maxLength={9}
                    className={inp}
                  />
                  {buscandoCep && (
                    <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">ou</span>
              </div>

              {/* Endereço + botão mapa */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={rascunhoEnd}
                    onChange={e => setRascunhoEnd(e.target.value)}
                    placeholder="Digite o endereço completo"
                    className={inp + " pl-8"}
                  />
                </div>
                <button
                  onClick={() => setMapaAberto(true)}
                  title="Selecionar no mapa"
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 shrink-0 cursor-pointer transition-colors"
                >
                  <MapPin size={14} />
                </button>
              </div>

              <div className="flex gap-2 mt-1">
                <button onClick={() => { setEditandoEnd(false); setCep(""); }}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold cursor-pointer hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={confirmarEndereco} disabled={salvando || !rascunhoEnd.trim()}
                  className="flex-1 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  style={{ background: "#00B040" }}>
                  <Check size={13} strokeWidth={2.5} />
                  {salvando ? "Salvando..." : "Salvar endereço"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 mt-1">
              <p className={`text-sm flex-1 ${config.endereco ? "text-gray-800 font-medium" : "text-gray-400 italic"}`}>
                {config.endereco || "Rua Exemplo, 123 — Bairro, Cidade - UF"}
              </p>
              <button onClick={() => { setEditandoEnd(true); setRascunhoEnd(config.endereco); }}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 shrink-0 cursor-pointer transition-colors">
                <Pencil size={13} />
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Clique no lápis para editar. No endereço, use o CEP para preencher automaticamente ou o pin para selecionar no mapa.
        </p>
      </div>

      {/* Mapa picker */}
      {mapaAberto && (
        <MapaPicker
          enderecoInicial={rascunhoEnd || config.endereco}
          onConfirmar={end => setRascunhoEnd(end)}
          onFechar={() => setMapaAberto(false)}
        />
      )}
    </div>
  );
}
