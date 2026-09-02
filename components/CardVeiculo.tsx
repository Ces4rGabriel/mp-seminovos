import Link from "next/link";
import Image from "next/image";
import { Gauge, Calendar, Cog } from "lucide-react";
import type { Veiculo } from "@/lib/supabase";

function formatPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function CardVeiculo({ veiculo }: { veiculo: Veiculo }) {
  const foto = veiculo.fotos?.[0];

  return (
    <Link href={`/veiculo/${veiculo.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-xl hover:border-green-300 transition-all duration-300">

        {/* Foto */}
        <div className="relative aspect-[16/9] bg-gray-100">
          {foto ? (
            <Image
              src={foto}
              alt={`${veiculo.marca} ${veiculo.modelo}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">Sem foto</div>
          )}

          {veiculo.destaque && (
            <span className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow" style={{ background: "#00B040" }}>
              ⭐ Destaque
            </span>
          )}

          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Info — altura fixa para uniformidade */}
        <div className="p-3 h-[100px] flex flex-col justify-between overflow-hidden">
          <div>
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider leading-none mb-0.5">{veiculo.marca}</p>
            <h3 className="text-gray-900 font-black text-sm leading-tight line-clamp-1">{veiculo.modelo}</h3>
            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-1">
              <span className="flex items-center gap-0.5"><Calendar size={9} />{veiculo.ano}</span>
              <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-0.5"><Gauge size={9} />{veiculo.km.toLocaleString("pt-BR")} km</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-1.5">
            {veiculo.fipe_preco && veiculo.fipe_preco > veiculo.preco ? (
              <p className="text-[9px] font-medium line-through leading-none mb-0.5" style={{ color: "#DC2626" }}>
                FIPE {formatPreco(veiculo.fipe_preco)}
              </p>
            ) : (
              <div className="h-[12px]" />
            )}
            <p className="text-sm font-black leading-none" style={{ color: "#16A34A" }}>{formatPreco(veiculo.preco)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
