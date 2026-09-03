"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

export default function BotaoFlutuante({ whatsappUrl }: { whatsappUrl: string }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvo = document.getElementById("cta-principal");
    if (!alvo) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisivel(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(alvo);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe transition-transform duration-300 ${
        visivel ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        paddingTop: 12,
        background: "linear-gradient(to top, white 65%, transparent)",
      }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-2xl text-sm tracking-wide"
        style={{
          background: "#00B040",
          boxShadow: "0 4px 24px rgba(0,176,64,0.45)",
        }}
      >
        <Phone size={17} />
        Tenho interesse
      </a>
    </div>
  );
}
