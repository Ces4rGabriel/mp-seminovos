"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, Suspense } from "react";
import { Search } from "lucide-react";

function FiltroContent({ marcas }: { marcas: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const atualizar = useCallback(
    (chave: string, valor: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor) params.set(chave, valor);
      else params.delete(chave);
      router.push(`/?${params.toString()}#estoque`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar modelo..."
          defaultValue={searchParams.get("busca") ?? ""}
          onChange={(e) => atualizar("busca", e.target.value)}
          className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-green-500"
        />
      </div>

      <select
        defaultValue={searchParams.get("marca") ?? ""}
        onChange={(e) => atualizar("marca", e.target.value)}
        className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
      >
        <option value="">Todas as marcas</option>
        {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <select
        defaultValue={searchParams.get("preco_max") ?? ""}
        onChange={(e) => atualizar("preco_max", e.target.value)}
        className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
      >
        <option value="">Qualquer preço</option>
        <option value="30000">Até R$ 30.000</option>
        <option value="50000">Até R$ 50.000</option>
        <option value="80000">Até R$ 80.000</option>
        <option value="120000">Até R$ 120.000</option>
        <option value="200000">Até R$ 200.000</option>
      </select>
    </div>
  );
}

export default function FiltroVeiculos({ marcas }: { marcas: string[] }) {
  return (
    <Suspense>
      <FiltroContent marcas={marcas} />
    </Suspense>
  );
}
