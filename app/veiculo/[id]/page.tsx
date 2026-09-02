import { notFound } from "next/navigation";
import { supabase, type Veiculo } from "@/lib/supabase";
import Header from "@/components/Header";
import VeiculoGaleria from "@/components/VeiculoGaleria";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Phone, CalendarDays } from "lucide-react";

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
  const whatsappUrl = `https://wa.me/5500000000000?text=${whatsappMsg}`;
  const agendaMsg = `Olá! Gostaria de agendar uma visita para ver o ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}.`;

  const fotos = veiculo.fotos ?? [];
  const palavras = veiculo.modelo.split(" ");
  const modeloDestaqueWord = palavras[0];
  const modeloResto = palavras.slice(1).join(" ");

  const ficha = [
    { label: "Ano",           value: String(veiculo.ano) },
    { label: "Quilometragem", value: formatKm(veiculo.km) },
    { label: "Câmbio",        value: veiculo.cambio },
    { label: "Combustível",   value: veiculo.combustivel },
    { label: "Cor",           value: veiculo.cor },
    { label: "Tipo",          value: veiculo.tipo },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <VeiculoGaleria fotos={fotos} titulo={`${veiculo.marca} ${veiculo.modelo}`} />

      <div className="max-w-7xl mx-auto px-4 pt-3 pb-1">
        <Link
          href="/#estoque"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={13} />
          Voltar ao estoque
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 flex flex-col gap-6 pt-2">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{veiculo.marca}</p>
              <h1 className="text-3xl font-black uppercase tracking-wide leading-none">
                <span style={{ color: "#16A34A" }}>{modeloDestaqueWord}</span>
                {modeloResto && <span className="text-gray-800"> {modeloResto}</span>}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
                <span>{veiculo.ano}</span>
                <span className="text-gray-300">·</span>
                <span>{formatKm(veiculo.km)}</span>
                <span className="text-gray-300">·</span>
                <span>{veiculo.cor}</span>
                {veiculo.destaque && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ background: "#16A34A" }}>
                      Destaque
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Ficha técnica</h2>
              <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                {ficha.map(({ label, value }) => (
                  <div key={label} className="border-l-2 border-gray-100 pl-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {veiculo.opcionais && veiculo.opcionais.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Itens e opcionais</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                  {veiculo.opcionais.map((op) => (
                    <div key={op} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} className="shrink-0" style={{ color: "#16A34A" }} />
                      {op}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {veiculo.descricao && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Sobre este veículo</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{veiculo.descricao}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 flex flex-col gap-4 pt-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="mb-6">
                  {veiculo.fipe_preco && veiculo.fipe_preco > veiculo.preco && (
                    <p className="text-sm font-medium line-through mb-1" style={{ color: "#DC2626" }}>
                      FIPE {formatPreco(veiculo.fipe_preco)}
                    </p>
                  )}
                  <p className="text-3xl font-black leading-none" style={{ color: "#16A34A" }}>
                    {formatPreco(veiculo.preco)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">à vista · sujeito à disponibilidade</p>
                </div>

                {!veiculo.vendido ? (
                  <div className="flex flex-col gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl text-sm cursor-pointer"
                      style={{ background: "#00B040" }}
                    >
                      <Phone size={16} />
                      Tenho interesse
                    </a>
                    <a
                      href={`https://wa.me/5500000000000?text=${encodeURIComponent(agendaMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-gray-700 font-semibold py-3.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <CalendarDays size={16} />
                      Agendar visita
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold">
                    Veículo vendido
                  </div>
                )}

                <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
                  Entre em contato pelo WhatsApp para mais informações sobre condições de pagamento e financiamento.
                </p>
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