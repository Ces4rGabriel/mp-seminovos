"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function StickySearch({ marcas }: { marcas: string[] }) {
  const [visible, setVisible] = useState(false);
  const [busca, setBusca] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 260);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(busca ? `/?busca=${encodeURIComponent(busca)}#estoque` : "/#estoque");
  }

  return (
    <div
      className={`fixed left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md transition-all duration-300 ${
        visible ? "top-16 opacity-100" : "-top-20 opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-2.5">
        <form onSubmit={submit} className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-green-400 transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Modelo, versão..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold text-white rounded-full whitespace-nowrap"
            style={{ background: "#00B040" }}
          >
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
}
