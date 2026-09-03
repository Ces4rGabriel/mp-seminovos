"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Check, X, Loader2 } from "lucide-react";

type Props = {
  onConfirmar: (endereco: string) => void;
  onFechar: () => void;
  enderecoInicial?: string;
};

export default function MapaPicker({ onConfirmar, onFechar, enderecoInicial }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [endereco, setEndereco] = useState(enderecoInicial ?? "");
  const [buscando, setBuscando] = useState(false);
  const mapInstance = useRef<unknown>(null);
  const markerInstance = useRef<unknown>(null);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css" as string);

      if (destroyed || !mapRef.current) return;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = [-19.9167, -43.9345]; // BH default

      // If there's an initial address, try to geocode it
      let startPos = center;
      if (enderecoInicial) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enderecoInicial)}&format=json&limit=1`,
            { headers: { "Accept-Language": "pt-BR" } }
          );
          const data = await res.json();
          if (data[0]) startPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } catch { /* use default */ }
      }

      if (destroyed || !mapRef.current) return;

      const map = L.map(mapRef.current).setView(startPos, 15);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const marker = L.marker(startPos, { draggable: true }).addTo(map);
      markerInstance.current = marker;

      async function reverseGeocode(lat: number, lng: number) {
        if (destroyed) return;
        setBuscando(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`,
            { headers: { "Accept-Language": "pt-BR" } }
          );
          const data = await res.json();
          if (!destroyed && data.display_name) {
            // Format nicely: road + suburb + city + state
            const a = data.address;
            const partes = [
              a.road && a.house_number ? `${a.road}, ${a.house_number}` : a.road,
              a.suburb || a.neighbourhood || a.quarter,
              a.city || a.town || a.village,
              a.state_district || a.state,
            ].filter(Boolean);
            setEndereco(partes.join(" — "));
          }
        } catch { /* ignore */ } finally {
          if (!destroyed) setBuscando(false);
        }
      }

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        reverseGeocode(lat, lng);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
    }

    init();

    return () => {
      destroyed = true;
      if (mapInstance.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstance.current as any).remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: "#00B040" }} />
          <p className="text-sm font-bold text-gray-900">Selecione a localização</p>
        </div>
        <button onClick={onFechar} className="p-2 text-gray-400 hover:text-gray-700 cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* Instrução */}
      <p className="px-4 py-2 text-[11px] text-gray-400 bg-gray-50 border-b border-gray-100 shrink-0">
        Clique no mapa ou arraste o marcador para ajustar o ponto exato
      </p>

      {/* Mapa */}
      <div ref={mapRef} className="flex-1" />

      {/* Rodapé com endereço detectado */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          {buscando
            ? <Loader2 size={14} className="animate-spin text-gray-400 shrink-0" />
            : <MapPin size={14} style={{ color: "#00B040" }} className="shrink-0" />
          }
          <input
            type="text"
            value={endereco}
            onChange={e => setEndereco(e.target.value)}
            placeholder="Endereço detectado..."
            className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onFechar}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold cursor-pointer hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirmar(endereco); onFechar(); }}
            disabled={!endereco}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            style={{ background: "#00B040" }}
          >
            <Check size={15} strokeWidth={2.5} />
            Confirmar endereço
          </button>
        </div>
      </div>
    </div>
  );
}
