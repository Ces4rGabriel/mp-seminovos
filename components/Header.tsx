"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header({ whatsappUrl = "{whatsappUrl}" }: { whatsappUrl?: string }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 flex items-center gap-2.5">
          <Image
            src="/logos/mp/verde.png"
            alt="MP Seminovos"
            width={44}
            height={44}
            className="h-11 w-11 object-cover rounded-xl"
            priority
          />
          <span className="text-[17px] font-black text-gray-900 tracking-tight">MP Seminovos</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#estoque" className="hover:text-gray-900 transition-colors cursor-pointer">Estoque</a>
          <a href="#marcas" className="hover:text-gray-900 transition-colors cursor-pointer">Por marca</a>
          <a href="#contato" className="hover:text-gray-900 transition-colors cursor-pointer">Contato</a>
        </nav>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
          style={{ background: "#00B040" }}
        >
          <Phone size={14} />
          WhatsApp
        </a>

        <button className="md:hidden text-gray-600 cursor-pointer" onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuAberto && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700 bg-white">
          <a href="#estoque" onClick={() => setMenuAberto(false)}>Estoque</a>
          <a href="#marcas" onClick={() => setMenuAberto(false)}>Por marca</a>
          <a href="#contato" onClick={() => setMenuAberto(false)}>Contato</a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="text-white text-center font-semibold py-2 rounded-lg" style={{ background: "#00B040" }}>
            WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
