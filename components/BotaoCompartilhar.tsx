"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function BotaoCompartilhar({ className }: { className?: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      // user cancelled
    }
  }

  return (
    <button
      onClick={compartilhar}
      className={className ?? "flex items-center justify-center gap-2 text-gray-400 text-xs font-medium py-2 hover:text-gray-600 transition-colors w-full"}
    >
      {copiado ? <Check size={13} style={{ color: "#00B040" }} /> : <Share2 size={13} />}
      {copiado ? "Link copiado!" : "Compartilhar este anúncio"}
    </button>
  );
}
