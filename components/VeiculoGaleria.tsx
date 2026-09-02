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
      <div className="w-full bg-gray-200 flex items-center justify-center" style={{ height: "420px" }}>
        <span className="text-gray-400 text-sm">Sem fotos disponíveis</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900">
      <div className="relative w-full overflow-hidden" style={{ height: "480px" }}>
        <Image
          src={fotos[idx]}
          alt={titulo}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {fotos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition backdrop-blur-sm"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition backdrop-blur-sm"
              aria-label="Próxima foto"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/45 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              {idx + 1} / {fotos.length}
            </div>
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 bg-gray-950">
          {fotos.map((url, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`shrink-0 relative rounded overflow-hidden transition-all ${
                i === idx ? "ring-2 ring-white opacity-100" : "opacity-50 hover:opacity-80"
              }`}
              style={{ width: 88, height: 60 }}
            >
              <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
