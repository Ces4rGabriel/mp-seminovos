"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

export default function Hero({ marcas = [] }: { marcas?: string[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [marca, setMarca] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  function pesquisar() {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (marca) params.set("marca", marca);
    if (precoMin) params.set("preco_min", precoMin);
    if (precoMax) params.set("preco_max", precoMax);
    router.push(`/?${params.toString()}#estoque`);
  }

  const temFiltro = marca || precoMin || precoMax;

  return (
    <section className="relative" style={{ background: "#003314" }}>
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 py-5">
        <p className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-3 text-center">
          Seu próximo veículo está aqui
        </p>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Linha principal: busca + botão */}
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por modelo ou versão..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && pesquisar()}
                className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none placeholder-gray-400 bg-transparent"
              />
            </div>

            {/* Botão filtros — mobile */}
            <button
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              className={`md:hidden flex items-center justify-center w-9 h-9 shrink-0 rounded-xl transition-colors ${
                temFiltro ? "text-white" : "text-gray-400"
              }`}
              style={temFiltro ? { background: "#00B040" } : {}}
              title="Filtros"
            >
              <SlidersHorizontal size={15} />
            </button>

            <button
              onClick={pesquisar}
              className="shrink-0 text-white font-bold px-5 py-2.5 text-sm uppercase tracking-wider rounded-xl transition-colors"
              style={{ background: "#00B040" }}
              onMouseEnter={e => e.currentTarget.style.background = "#009935"}
              onMouseLeave={e => e.currentTarget.style.background = "#00B040"}
            >
              Buscar
            </button>
          </div>

          {/* Filtros — desktop sempre visível, mobile toggle */}
          <div
            className={`border-t border-gray-100 ${
              filtrosAbertos ? "block" : "hidden md:block"
            }`}
          >
            <div className="flex flex-col md:flex-row">
              <select
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="flex-1 py-2.5 px-3 text-sm text-gray-600 focus:outline-none bg-white border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer"
              >
                <option value="">Todas as marcas</option>
                {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>

              <select
                value={precoMin}
                onChange={(e) => setPrecoMin(e.target.value)}
                className="flex-1 py-2.5 px-3 text-sm text-gray-600 focus:outline-none bg-white border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer"
              >
                <option value="">Preço mínimo</option>
                <option value="20000">R$ 20.000</option>
                <option value="30000">R$ 30.000</option>
                <option value="50000">R$ 50.000</option>
                <option value="80000">R$ 80.000</option>
                <option value="100000">R$ 100.000</option>
              </select>

              <select
                value={precoMax}
                onChange={(e) => setPrecoMax(e.target.value)}
                className="flex-1 py-2.5 px-3 text-sm text-gray-600 focus:outline-none bg-white cursor-pointer"
              >
                <option value="">Preço máximo</option>
                <option value="30000">R$ 30.000</option>
                <option value="50000">R$ 50.000</option>
                <option value="80000">R$ 80.000</option>
                <option value="120000">R$ 120.000</option>
                <option value="200000">R$ 200.000</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
