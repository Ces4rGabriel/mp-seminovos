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
            className="shrink-0 flex flex-col items-center gap-1.5 transition-all group"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-all ring-2 ${
                ativo
                  ? "ring-green-600 shadow-md"
                  : "ring-gray-200 bg-gray-50 group-hover:ring-green-300"
              }`}
              style={ativo ? { background: "#e8f5e9" } : {}}
            >
              {logo_url ? (
                <Image src={logo_url} alt={nome} width={48} height={48} className="object-contain w-10 h-10" />
              ) : (
                <span className="text-2xl">🚗</span>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${ativo ? "text-green-700" : "text-gray-500 group-hover:text-gray-700"}`}>
              {nome}
            </span>
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
