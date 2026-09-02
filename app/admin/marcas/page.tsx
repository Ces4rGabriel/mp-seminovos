"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Upload, Tag } from "lucide-react";
import Image from "next/image";

type Marca = {
  id: string;
  nome: string;
  logo_url: string | null;
  created_at: string;
};

export default function AdminMarcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [novaLogoUrl, setNovaLogoUrl] = useState<string | null>(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase.from("marcas").select("*").order("nome");
    setMarcas(data ?? []);
    setCarregando(false);
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoLogo(true);
    const ext = arquivo.name.split(".").pop();
    const nome = `marca_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("veiculos")
      .upload(`marcas/${nome}`, arquivo, { contentType: arquivo.type });
    if (error) { alert("Erro no upload: " + error.message); setEnviandoLogo(false); return; }
    const { data: urlData } = supabase.storage.from("veiculos").getPublicUrl(data.path);
    setNovaLogoUrl(urlData.publicUrl);
    setEnviandoLogo(false);
    e.target.value = "";
  }

  async function salvar() {
    if (!novoNome.trim()) return;
    setSalvando(true);
    await supabase.from("marcas").insert({ nome: novoNome.trim(), logo_url: novaLogoUrl });
    setNovoNome("");
    setNovaLogoUrl(null);
    setSalvando(false);
    carregar();
  }

  async function excluir(id: string, nome: string) {
    if (!window.confirm(`Excluir a marca "${nome}"?`)) return;
    await supabase.from("marcas").delete().eq("id", id);
    carregar();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Estoque · Marcas</p>
          <h1 className="text-3xl font-black text-gray-900 leading-none uppercase tracking-wide">
            Marcas
          </h1>
        </div>
      </div>

      {/* Card nova marca */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Nova marca</p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Upload logo */}
          <div className="shrink-0">
            <label className="block w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all overflow-hidden">
              {novaLogoUrl ? (
                <Image src={novaLogoUrl} alt="logo" width={80} height={80} className="object-contain w-full h-full p-2" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                  {enviandoLogo ? (
                    <span className="text-[10px]">Enviando...</span>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span className="text-[10px] font-semibold">Logo</span>
                    </>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={enviandoLogo} />
            </label>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Nome da marca *</label>
              <input
                type="text"
                placeholder="Ex: Volkswagen"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && salvar()}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={salvar}
              disabled={salvando || !novoNome.trim()}
              className="flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-xl text-[11px] uppercase tracking-wider disabled:opacity-40 transition-colors cursor-pointer"
              style={{ background: "#00B040" }}
              onMouseEnter={e => { if (!salvando) e.currentTarget.style.background = "#009935"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#00B040"; }}
            >
              <Plus size={14} strokeWidth={2.5} />
              {salvando ? "Salvando..." : "Adicionar marca"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!carregando && marcas.length > 0 && (
        <div className="grid grid-cols-1 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#003314" }}>
              <Tag size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total de marcas</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{marcas.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <p className="text-gray-400 text-center py-10 text-[10px] uppercase tracking-widest font-semibold">Carregando...</p>
      ) : marcas.length === 0 ? (
        <div className="text-center py-16">
          <Tag size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Nenhuma marca cadastrada</p>
          <p className="text-[10px] uppercase tracking-widest font-bold mt-2" style={{ color: "#00B040" }}>
            Adicione a primeira acima
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {marcas.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-3 group relative shadow-sm hover:border-gray-300 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                {m.logo_url ? (
                  <Image src={m.logo_url} alt={m.nome} width={56} height={56} className="object-contain w-full h-full p-1" />
                ) : (
                  <span className="text-xl text-gray-300">🚗</span>
                )}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700 text-center">{m.nome}</p>
              <button
                onClick={() => excluir(m.id, m.nome)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
