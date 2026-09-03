"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

type Marca = { id: string; nome: string; logo_url: string | null };

function NavContent({ marcas }: { marcas: Marca[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const marcaAtiva = searchParams.get("marca") ?? "";

  const [offset, setOffset] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4); // mobile-first: 4 visíveis
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const update = () => {
      const n = window.innerWidth < 640 ? 4 : marcas.length;
      setVisibleCount(Math.min(n, marcas.length));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [marcas.length]);

  if (marcas.length === 0) return null;

  // Mostra visibleCount + 1 item (o extra cria o efeito de peek)
  const peekCount = visibleCount < marcas.length ? visibleCount + 1 : visibleCount;
  const displayed = Array.from({ length: peekCount }, (_, i) => marcas[(i + offset) % marcas.length]);
  // Largura por item: divida pelos visíveis reais (o extra fica parcialmente cortado)
  const itemPct = visibleCount < marcas.length
    ? `${100 / (visibleCount + 0.5)}%`
    : `${100 / visibleCount}%`;

  function selecionar(nome: string) {
    if (dragging.current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (marcaAtiva === nome) params.delete("marca");
    else params.set("marca", nome);
    router.push(`/?${params.toString()}#estoque`);
  }

  function onDown(clientX: number) {
    startX.current = clientX;
    dragging.current = false;
  }
  function onMove(clientX: number) {
    if (startX.current === null) return;
    const dx = clientX - startX.current;
    if (Math.abs(dx) > 8) dragging.current = true;
    setDragDelta(dx);
  }
  function onUp(clientX: number) {
    if (startX.current === null) return;
    const dx = clientX - startX.current;
    const THRESHOLD = 55;
    if (dx < -THRESHOLD) setOffset((o) => (o + 1) % marcas.length);
    else if (dx > THRESHOLD) setOffset((o) => (o - 1 + marcas.length) % marcas.length);
    startX.current = null;
    setDragDelta(0);
    setTimeout(() => { dragging.current = false; }, 60);
  }

  const showFade = visibleCount < marcas.length;

  return (
    <div className="relative w-full">
      {/* Gradiente direita — indica que tem mais marcas */}
      {showFade && (
        <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none sm:hidden"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.95))" }} />
      )}
    <div
      className="w-full select-none overflow-hidden"
      style={{ cursor: dragging.current ? "grabbing" : "grab" }}
      onMouseDown={(e) => onDown(e.clientX)}
      onMouseMove={(e) => { if (startX.current !== null) onMove(e.clientX); }}
      onMouseUp={(e) => onUp(e.clientX)}
      onMouseLeave={() => { setDragDelta(0); startX.current = null; }}
      onTouchStart={(e) => onDown(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={(e) => onUp(e.changedTouches[0].clientX)}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(${dragDelta * 0.25}px)`,
          transition: dragDelta === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        {displayed.map(({ id, nome, logo_url }) => {
          const ativo = marcaAtiva === nome;
          return (
            <div
              key={id + offset}
              onClick={() => selecionar(nome)}
              className="flex flex-col items-center gap-1.5 group"
              style={{ width: itemPct, flexShrink: 0 }}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all ring-2 ${
                  ativo
                    ? "ring-green-600 shadow-md"
                    : "ring-gray-200 bg-gray-50 group-hover:ring-green-400 group-hover:shadow-sm"
                }`}
                style={ativo ? { background: "#e8f5e9" } : {}}
              >
                {logo_url ? (
                  <Image src={logo_url} alt={nome} width={52} height={52} className="object-contain w-11 h-11 pointer-events-none" />
                ) : (
                  <span className="text-2xl pointer-events-none">🚗</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold text-center leading-tight pointer-events-none w-full truncate px-1 ${
                  ativo ? "text-green-700" : "text-gray-500 group-hover:text-green-600"
                }`}
              >
                {nome}
              </span>
            </div>
          );
        })}
      </div>
    </div>
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
