"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VeiculoGaleria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + fotos.length) % fotos.length);
  const next = () => setIdx((i) => (i + 1) % fotos.length);

  if (fotos.length === 0) {
    return (
      <div className="w-full aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Sem fotos disponíveis</span>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden bg-gray-900">
      <div className="relative w-full aspect-video">
        <Image src={fotos[idx]} alt={titulo} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 66vw" />
        {fotos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition backdrop-blur-sm">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition backdrop-blur-sm">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/50"}`} />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/45 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              {idx + 1}/{fotos.length}
            </div>
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="flex gap-1 overflow-x-auto px-2 py-2 bg-gray-950">
          {fotos.map((url, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`shrink-0 relative rounded overflow-hidden transition-all ${i === idx ? "ring-2 ring-white opacity-100" : "opacity-45 hover:opacity-75"}`} style={{ width: 72, height: 50 }}>
              <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
