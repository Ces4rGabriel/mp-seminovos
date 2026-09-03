"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Store, Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";

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

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#003314" }}>
          <Icon size={15} className="text-white" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all placeholder-gray-400";

export default function AdminConfiguracoes() {
  const [config, setConfig] = useState<Config>(vazio);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();
    if (data) setConfig(data);
    setCarregando(false);
  }

  function set(chave: keyof Config, valor: string) {
    setConfig((c) => ({ ...c, [chave]: valor }));
    setSalvo(false);
  }

  async function salvar() {
    setSalvando(true);
    const payload = {
      nome_loja: config.nome_loja,
      whatsapp: config.whatsapp,
      endereco: config.endereco,
      horario: config.horario,
      instagram: config.instagram,
      facebook: config.facebook,
    };

    if (config.id) {
      await supabase.from("configuracoes").update(payload).eq("id", config.id);
    } else {
      const { data } = await supabase.from("configuracoes").insert(payload).select().single();
      if (data) setConfig(data);
    }

    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
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
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin · Loja</p>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-none uppercase tracking-wide">
            Configurações
          </h1>
        </div>
        <button
          onClick={salvar}
          disabled={salvando}
          className="flex items-center gap-2 text-white text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg cursor-pointer disabled:opacity-50 transition-colors shrink-0"
          style={{ background: salvo ? "#003314" : "#00B040" }}
          onMouseEnter={e => { if (!salvando && !salvo) e.currentTarget.style.background = "#009935"; }}
          onMouseLeave={e => { e.currentTarget.style.background = salvo ? "#003314" : "#00B040"; }}
        >
          <Save size={14} strokeWidth={2.5} />
          {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar"}
        </button>
      </div>

      <div className="space-y-4">

        {/* Loja */}
        <Section icon={Store} title="Dados da loja">
          <Field label="Nome da loja">
            <input
              type="text"
              value={config.nome_loja}
              onChange={e => set("nome_loja", e.target.value)}
              className={inp}
              placeholder="MP Seminovos"
            />
          </Field>
          <Field label="Endereço">
            <input
              type="text"
              value={config.endereco}
              onChange={e => set("endereco", e.target.value)}
              className={inp}
              placeholder="Rua Exemplo, 123 — Bairro, Cidade - UF"
            />
          </Field>
          <Field label="Horário de atendimento">
            <input
              type="text"
              value={config.horario}
              onChange={e => set("horario", e.target.value)}
              className={inp}
              placeholder="Seg a Sex: 8h–18h · Sáb: 8h–13h"
            />
          </Field>
        </Section>

        {/* Contato */}
        <Section icon={Phone} title="Contato">
          <Field label="WhatsApp (com DDI e DDD, só números)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">+</span>
              <input
                type="text"
                value={config.whatsapp}
                onChange={e => set("whatsapp", e.target.value.replace(/\D/g, ""))}
                className={inp + " pl-7"}
                placeholder="5511999999999"
                maxLength={15}
              />
            </div>
            {config.whatsapp && (
              <p className="text-[10px] text-gray-400 mt-1.5">
                Link gerado: wa.me/{config.whatsapp}
              </p>
            )}
          </Field>
        </Section>

        {/* Redes sociais */}
        <Section icon={Instagram} title="Redes sociais">
          <Field label="Instagram (@ ou URL completa)">
            <div className="relative">
              <Instagram size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={config.instagram}
                onChange={e => set("instagram", e.target.value)}
                className={inp + " pl-9"}
                placeholder="@mpseminovos"
              />
            </div>
          </Field>
          <Field label="Facebook (@ ou URL completa)">
            <div className="relative">
              <Facebook size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={config.facebook}
                onChange={e => set("facebook", e.target.value)}
                className={inp + " pl-9"}
                placeholder="facebook.com/mpseminovos"
              />
            </div>
          </Field>
        </Section>

      </div>

      {/* Aviso sobre atualização do site */}
      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed">
          As configurações salvas aqui são lidas pelo site automaticamente. Após salvar, o site exibirá os dados atualizados em alguns segundos.
        </p>
      </div>

    </div>
  );
}
