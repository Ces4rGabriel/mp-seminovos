import { notFound } from "next/navigation";
import { supabase, type Veiculo } from "@/lib/supabase";
import Header from "@/components/Header";
import VeiculoGaleria from "@/components/VeiculoGaleria";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Phone, CalendarDays, Gauge, Cog, Fuel, Palette, Calendar, Share2 } from "lucide-react";
import StickySearch from "@/components/StickySearch";

export const revalidate = 60;

function formatKm(km: number) {
  if (km === 0) return "0 km";
  return km.toLocaleString("pt-BR") + " km";
}

function formatPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export default async function VeiculoPage({ params }: { params: Promise<{ id: string }> }) {
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
  const whatsappUrl = `https://wa.me/5531999561226?text=${whatsappMsg}`;
  const agendaMsg = `Olá! Gostaria de agendar uma visita para ver o ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}.`;

  const fotos = veiculo.fotos ?? [];
  const palavras = veiculo.modelo.split(" ");
  const modeloPrimeira = palavras[0];
  const modeloResto = palavras.slice(1).join(" ");

  const especCards = [
    { icon: Gauge,    label: "Quilometragem", value: formatKm(veiculo.km) },
    { icon: Calendar, label: "Ano",           value: String(veiculo.ano) },
    { icon: Cog,      label: "Câmbio",        value: veiculo.cambio },
    { icon: Fuel,     label: "Combustível",   value: veiculo.combustivel },
    { icon: Palette,  label: "Cor",           value: veiculo.cor },
  ];

  const cardPreco = (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{veiculo.marca}</p>
      <h1 className="text-xl font-black uppercase tracking-wide leading-tight mb-1">
        <span style={{ color: "#16A34A" }}>{modeloPrimeira}</span>
        {modeloResto && <span className="text-gray-800"> {modeloResto}</span>}
      </h1>
      <p className="text-sm text-gray-500 mb-5">
        {veiculo.ano} &nbsp;·&nbsp; {formatKm(veiculo.km)}
        {veiculo.destaque && (
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white align-middle" style={{ background: "#16A34A" }}>
            Destaque
          </span>
        )}
      </p>

      <div className="border-t border-gray-100 pt-4 mb-5">
        {veiculo.fipe_preco && veiculo.fipe_preco > veiculo.preco && (
          <p className="text-sm font-medium line-through mb-0.5" style={{ color: "#DC2626" }}>
            {formatPreco(veiculo.fipe_preco)}
          </p>
        )}
        <p className="text-3xl font-black leading-none" style={{ color: "#16A34A" }}>
          {formatPreco(veiculo.preco)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">à vista · sujeito à disponibilidade</p>
      </div>

      {!veiculo.vendido ? (
        <div className="flex flex-col gap-2.5">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm"
            style={{ background: "#00B040" }}>
            <Phone size={15} />
            Tenho interesse
          </a>
          <a href={`https://wa.me/5531999561226?text=${encodeURIComponent(agendaMsg)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl text-sm border-2 transition-colors"
            style={{ color: "#00B040", borderColor: "#00B040" }}>
            <CalendarDays size={15} />
            Agendar visita
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-center py-3.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold">
          Veículo vendido
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <StickySearch always />

      <div className="max-w-7xl mx-auto px-4 py-3">
        <Link href="/#estoque" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft size={13} />
          Voltar ao estoque
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna esquerda: galeria + preço (mobile) + specs + conteúdo */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <VeiculoGaleria fotos={fotos} titulo={`${veiculo.marca} ${veiculo.modelo}`} />

            {/* Preço aparece aqui no mobile, logo após a galeria */}
            <div className="lg:hidden flex flex-col gap-2">
              {cardPreco}
              <button className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium py-2 hover:text-gray-600 transition-colors w-full">
                <Share2 size={13} />
                Compartilhar este anúncio
              </button>
            </div>

            {/* Cards de specs: 3 colunas no mobile, 5 no desktop */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {especCards.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3 flex flex-col items-center gap-1.5 border border-gray-100 shadow-sm text-center">
                  <Icon size={20} strokeWidth={1.5} className="text-gray-400" />
                  <p className="text-xs font-bold text-gray-800 leading-tight">{value}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide leading-none">{label}</p>
                </div>
              ))}
            </div>

            {veiculo.descricao && (
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 mb-3">Sobre este veículo</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{veiculo.descricao}</p>
              </div>
            )}

            {veiculo.opcionais && veiculo.opcionais.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 mb-4">Acessórios e opcionais</h2>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {veiculo.opcionais.map((op) => (
                    <div key={op} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} className="shrink-0" style={{ color: "#16A34A" }} />
                      {op}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna direita: apenas no desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 flex flex-col gap-3">
              {cardPreco}
              <button className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium py-2 hover:text-gray-600 transition-colors">
                <Share2 size={13} />
                Compartilhar este anúncio
              </button>
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