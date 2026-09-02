import { notFound } from "next/navigation";
import { supabase, type Veiculo } from "@/lib/supabase";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Gauge,
  Cog,
  Fuel,
  Palette,
  Calendar,
  CheckCircle2,
  Phone,
  CalendarDays,
  Share2,
  Tag,
} from "lucide-react";

export const revalidate = 60;

function formatKm(km: number) {
  if (km === 0) return "0 km";
  return km.toLocaleString("pt-BR") + " km";
}

function formatPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export default async function VeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: veiculo } = await supabase
    .from("veiculos")
    .select("*")
    .eq("id", id)
    .single<Veiculo>();

  if (!veiculo) notFound();

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano} anunciado no site da MP Seminovos.`
  );
  const whatsappUrl = `https://wa.me/5500000000000?text=${whatsappMsg}`;
  const agendaMsg = `Olá! Gostaria de agendar uma visita para ver o ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}.`;

  const ficha = [
    { icon: Calendar,  label: "Ano",           value: veiculo.ano },
    { icon: Gauge,     label: "Quilometragem",  value: formatKm(veiculo.km) },
    { icon: Cog,       label: "Cambio",         value: veiculo.cambio },
    { icon: Fuel,      label: "Combustivel",    value: veiculo.combustivel },
    { icon: Palette,   label: "Cor",            value: veiculo.cor },
    { icon: Tag,       label: "Tipo",           value: veiculo.tipo },
  ];

  const fotos = veiculo.fotos ?? [];
  const capaUrl = fotos[0] ?? null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link
          href="/#estoque"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          Voltar ao estoque
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 flex flex-col gap-6">

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
              {capaUrl ? (
                <Image
                  src={capaUrl}
                  alt={`${veiculo.marca} ${veiculo.modelo}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  Sem foto
                </div>
              )}
              {veiculo.destaque && (
                <span
                  className="absolute top-3 left-3 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: "#00B040" }}
                >
                  Destaque
                </span>
              )}
              {veiculo.vendido && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-black uppercase tracking-widest">Vendido</span>
                </div>
              )}
            </div>

            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {fotos.map((url, i) => (
                  <div key={i} className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gray-200">
                    <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Ficha técnica</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ficha.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <Icon size={16} strokeWidth={1.5} className="shrink-0 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{String(value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {veiculo.opcionais && veiculo.opcionais.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Opcionais</h2>
                <div className="flex flex-wrap gap-2">
                  {veiculo.opcionais.map((op) => (
                    <span key={op} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                      <CheckCircle2 size={12} style={{ color: "#00B040" }} />
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {veiculo.descricao && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Descrição</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{veiculo.descricao}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{veiculo.marca}</p>
                <h1 className="text-xl font-black text-gray-900 uppercase tracking-wide leading-tight">
                  {veiculo.modelo}
                </h1>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 mb-5 text-xs text-gray-500">
                  <span>{veiculo.ano}</span>
                  <span>&middot;</span>
                  <span>{formatKm(veiculo.km)}</span>
                  <span>&middot;</span>
                  <span>{veiculo.cor}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 mb-5">
                  {veiculo.fipe_preco && veiculo.fipe_preco > veiculo.preco && (
                    <p className="text-xs font-medium line-through mb-0.5" style={{ color: "#DC2626" }}>
                      FIPE {formatPreco(veiculo.fipe_preco)}
                    </p>
                  )}
                  <p className="text-2xl font-black" style={{ color: "#16A34A" }}>
                    {formatPreco(veiculo.preco)}
                  </p>
                </div>
                {!veiculo.vendido ? (
                  <div className="flex flex-col gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm cursor-pointer"
                      style={{ background: "#00B040" }}
                    >
                      <Phone size={16} />
                      Tenho interesse
                    </a>
                    <a
                      href={`https://wa.me/5500000000000?text=${encodeURIComponent(agendaMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-gray-700 font-semibold py-3 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <CalendarDays size={16} />
                      Agendar visita
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold">
                    Veículo vendido
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium py-2">
                <Share2 size={14} />
                Compartilhar este veículo
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer className="py-5 border-t border-gray-200 text-center text-xs text-gray-400 bg-white">
        © {new Date().getFullYear()} MP Seminovos · Todos os direitos reservados
      </footer>
    </main>
  );
}