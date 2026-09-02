"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

type Marca = { id: string; nome: string; logo_url: string | null };

function NavContent({ marcas }: { marcas: Marca[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const marcaAtiva = searchParams.get("marca") ?? "";

  function selecionar(nome: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (marcaAtiva === nome) params.delete("marca");
    else params.set("marca", nome);
    router.push(`/?${params.toString()}#estoque`);
  }

  if (marcas.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {marcas.map(({ id, nome, logo_url }) => {
        const ativo = marcaAtiva === nome;
        return (
          <button
            key={id}
            onClick={() => selecionar(nome)}
            className={`shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 transition-all min-w-[90px] ${
              ativo ? "border-transparent text-white shadow-lg" : "border-gray-200 bg-white text-gray-600 hover:border-green-400"
            }`}
            style={ativo ? { background: "#003314" } : {}}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${ativo ? "bg-white/10" : "bg-gray-50"}`}>
              {logo_url ? (
                <Image src={logo_url} alt={nome} width={48} height={48} className="object-contain w-full h-full p-1" />
              ) : (
                <span className="text-2xl">🚗</span>
              )}
            </div>
            <span className="text-xs font-bold">{nome}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function NavMarcas({ marcas }: { marcas: Marca[] }) {
  return (
    <Suspense>
      <NavContent marcas={marcas} />
    </Suspense>
  );
}
