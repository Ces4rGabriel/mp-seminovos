"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Check, X, Store, Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";

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

type CampoKey = keyof Omit<Config, "id">;

const campos: {
  key: CampoKey;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  prefix?: string;
}[] = [
  { key: "nome_loja",  label: "Nome da loja",                     placeholder: "MP Seminovos",                    icon: Store },
  { key: "whatsapp",   label: "WhatsApp (DDI+DDD+número)",         placeholder: "5531999999999",                   icon: Phone, prefix: "+" },
  { key: "endereco",   label: "Endereço",                          placeholder: "Rua Exemplo, 123 — Bairro, Cidade - UF", icon: MapPin },
  { key: "horario",    label: "Horário de atendimento",            placeholder: "Seg a Sex: 8h–18h · Sáb: 8h–13h", icon: Clock },
  { key: "instagram",  label: "Instagram (@ ou URL)",              placeholder: "@mpseminovos",                    icon: Instagram },
  { key: "facebook",   label: "Facebook (@ ou URL)",               placeholder: "facebook.com/mpseminovos",        icon: Facebook },
];

export default function AdminConfiguracoes() {
  const [config, setConfig]       = useState<Config>(vazio);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando]   = useState<CampoKey | null>(null);
  const [rascunho, setRascunho]   = useState("");
  const [salvando, setSalvando]   = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();
    if (data) setConfig(data);
    setCarregando(false);
  }

  function abrirEdicao(key: CampoKey) {
    setEditando(key);
    setRascunho(config[key]);
  }

  function cancelar() {
    setEditando(null);
    setRascunho("");
  }

  async function salvarCampo() {
    if (!editando) return;
    setSalvando(true);

    const valor = editando === "whatsapp"
      ? rascunho.replace(/\D/g, "")
      : rascunho.trim();

    const novoConfig = { ...config, [editando]: valor };

    if (config.id) {
      await supabase.from("configuracoes").update({ [editando]: valor }).eq("id", config.id);
    } else {
      const payload = { ...vazio, ...novoConfig };
      const { data } = await supabase.from("configuracoes").insert(payload).select().single();
      if (data) { setConfig(data); setSalvando(false); setEditando(null); return; }
    }

    setConfig(novoConfig);
    setSalvando(false);
    setEditando(null);
  }

  if (carregando) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center py-20">Carregando...</p>
      </div>
    );
  }

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
        {campos.map(({ key, label, placeholder, icon: Icon, prefix }) => {
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
                    {prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">{prefix}</span>
                    )}
                    <input
                      autoFocus
                      type="text"
                      value={rascunho}
                      onChange={e => setRascunho(
                        key === "whatsapp" ? e.target.value.replace(/\D/g, "") : e.target.value
                      )}
                      onKeyDown={e => {
                        if (e.key === "Enter") salvarCampo();
                        if (e.key === "Escape") cancelar();
                      }}
                      placeholder={placeholder}
                      maxLength={key === "whatsapp" ? 15 : undefined}
                      className={`w-full bg-gray-50 border border-green-400 text-gray-900 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 ${prefix ? "pl-7 pr-3" : "px-3"}`}
                    />
                  </div>
                  <button
                    onClick={salvarCampo}
                    disabled={salvando}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 disabled:opacity-50 cursor-pointer"
                    style={{ background: "#00B040" }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={cancelar}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 mt-1">
                  <p className={`text-sm flex-1 truncate ${valor ? "text-gray-800 font-medium" : "text-gray-400 italic"}`}>
                    {key === "whatsapp" && valor ? `+${valor}` : (valor || placeholder)}
                  </p>
                  <button
                    onClick={() => abrirEdicao(key)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 shrink-0 cursor-pointer transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Clique no lápis para editar cada campo. As alterações são salvas individualmente e aplicadas ao site em instantes.
        </p>
      </div>

    </div>
  );
}
