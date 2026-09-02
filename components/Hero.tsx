"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function Hero({ marcas = [] }: { marcas?: string[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [marca, setMarca] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");

  function pesquisar() {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (marca) params.set("marca", marca);
    if (precoMin) params.set("preco_min", precoMin);
    if (precoMax) params.set("preco_max", precoMax);
    router.push(`/?${params.toString()}#estoque`);
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#003314" }}
    >
      {/* Padrão de pontos sutil */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Background com carros */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/foto-bg-green-carros.png')" }}
      />

      {/* Conteúdo */}
      <div className="relative max-w-5xl mx-auto px-4 py-7">
        <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3 text-center">
          Seu próximo veículo está aqui
        </p>

        {/* Barra de busca */}
        <div className="bg-white rounded-2xl shadow-xl p-3">
          <div className="flex flex-col md:flex-row gap-2">

            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Modelo, versão..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && pesquisar()}
                className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 placeholder-gray-400 cursor-text"
              />
            </div>

            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="py-2.5 px-3 text-sm text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white min-w-[140px] cursor-pointer"
            >
              <option value="">Todas as marcas</option>
              {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
              value={precoMin}
              onChange={(e) => setPrecoMin(e.target.value)}
              className="py-2.5 px-3 text-sm text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white min-w-[130px] cursor-pointer"
            >
              <option value="">Preço mín.</option>
              <option value="20000">R$ 20.000</option>
              <option value="30000">R$ 30.000</option>
              <option value="50000">R$ 50.000</option>
              <option value="80000">R$ 80.000</option>
              <option value="100000">R$ 100.000</option>
            </select>

            <select
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value)}
              className="py-2.5 px-3 text-sm text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white min-w-[130px] cursor-pointer"
            >
              <option value="">Preço máx.</option>
              <option value="30000">R$ 30.000</option>
              <option value="50000">R$ 50.000</option>
              <option value="80000">R$ 80.000</option>
              <option value="120000">R$ 120.000</option>
              <option value="200000">R$ 200.000</option>
            </select>

            <button
              onClick={pesquisar}
              className="text-white font-bold px-6 py-2.5 rounded-xl shrink-0 transition-colors text-sm uppercase tracking-wider"
              style={{ background: "#00B040" }}
              onMouseEnter={e => e.currentTarget.style.background = "#009935"}
              onMouseLeave={e => e.currentTarget.style.background = "#00B040"}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
