"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function FavButton({ id }: { id: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mp_favs") ?? "[]");
      setFav(saved.includes(id));
    } catch {}
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("mp_favs") ?? "[]");
      const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
      localStorage.setItem("mp_favs", JSON.stringify(next));
      setFav(next.includes(id));
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
    >
      <Heart
        size={14}
        strokeWidth={2}
        className={fav ? "fill-red-500 stroke-red-500" : "stroke-gray-500"}
      />
    </button>
  );
}
