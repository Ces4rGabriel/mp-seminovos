"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type Marca = { id: string; nome: string; logo_url: string | null };

function NavContent({ marcas }: { marcas: Marca[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const marcaAtiva = searchParams.get("marca") ?? "";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [podeRolarDir, setPodeRolarDir] = useState(false);
  const [podeRolarEsq, setPodeRolarEsq] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function check() {
      if (!el) return;
      setPodeRolarDir(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
      setPodeRolarEsq(el.scrollLeft > 4);
    }
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [marcas]);

  if (marcas.length === 0) return null;

  function selecionar(nome: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (marcaAtiva === nome) params.delete("marca");
    else params.set("marca", nome);
    router.push(`/?${params.toString()}#estoque`);
  }

  function rolarDireita() {
    scrollRef.current?.scrollBy({ left: 160, behavior: "smooth" });
  }
  function rolarEsquerda() {
    scrollRef.current?.scrollBy({ left: -160, behavior: "smooth" });
  }

  return (
    <div className="relative w-full">
      {/* Fade + seta esquerda */}
      {podeRolarEsq && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pointer-events-none sm:hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-16"
            style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.97))" }}
          />
          <button
            onClick={rolarEsquerda}
            className="relative z-10 pointer-events-auto ml-1 w-7 h-7 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center"
          >
            <ChevronLeft size={14} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Fade + seta direita */}
      {podeRolarDir && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pointer-events-none sm:hidden">
          <div
            className="absolute right-0 top-0 bottom-0 w-16"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.97))" }}
          />
          <button
            onClick={rolarDireita}
            className="relative z-10 pointer-events-auto mr-1 w-7 h-7 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center"
          >
            <ChevronRight size={14} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Scroll nativo (mobile) / wrap (desktop) */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto md:overflow-x-visible md:flex-wrap py-2"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {marcas.map(({ id, nome, logo_url }) => {
          const ativo = marcaAtiva === nome;
          return (
            <button
              key={id}
              onClick={() => selecionar(nome)}
              className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none w-[22.5%] min-w-[72px] md:w-auto md:min-w-0 md:px-3"
              style={{ scrollSnapAlign: "start" }}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-all ring-2 ${
                  ativo
                    ? "ring-green-600 shadow-md"
                    : "ring-gray-200 bg-gray-50 group-hover:ring-green-400 group-hover:shadow-sm"
                }`}
                style={ativo ? { background: "#e8f5e9" } : {}}
              >
                {logo_url ? (
                  <Image
                    src={logo_url}
                    alt={nome}
                    width={44}
                    height={44}
                    className="object-contain w-10 h-10 pointer-events-none"
                  />
                ) : (
                  <span className="text-xl pointer-events-none">🚗</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold text-center leading-tight w-full truncate px-1 ${
                  ativo ? "text-green-700" : "text-gray-500 group-hover:text-green-600"
                }`}
              >
                {nome}
              </span>
            </button>
          );
        })}
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
