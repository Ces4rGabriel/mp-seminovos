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
        <div className="relative aspect-[16/7] bg-gray-100">
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

        {/* Info */}
        <div className="p-3">
          <div className="mb-2">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{veiculo.marca}</p>
            <h3 className="text-gray-900 font-black text-sm leading-tight">{veiculo.modelo}</h3>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-[10px] mb-3 flex-wrap">
            <span className="flex items-center gap-0.5">
              <Calendar size={10} />
              {veiculo.ano}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="flex items-center gap-0.5">
              <Gauge size={10} />
              {veiculo.km.toLocaleString("pt-BR")} km
            </span>
          </div>

          <div className="border-t border-gray-100 pt-2">
            {veiculo.fipe_preco && veiculo.fipe_preco > veiculo.preco && (
              <p className="text-[10px] text-gray-400 line-through">
                FIPE {formatPreco(veiculo.fipe_preco)}
              </p>
            )}
            <p className="text-base font-black" style={{ color: "#003314" }}>{formatPreco(veiculo.preco)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
