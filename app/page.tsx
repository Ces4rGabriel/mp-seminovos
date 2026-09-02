import { supabase, type Veiculo } from "@/lib/supabase";
import CardVeiculo from "@/components/CardVeiculo";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NavMarcas from "@/components/NavMarcas";
import { Phone, Car, ShieldCheck, TrendingUp, CreditCard, MessageCircle } from "lucide-react";

type Marca = { id: string; nome: string; logo_url: string | null };

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ marca?: string; preco_min?: string; preco_max?: string; busca?: string }>;
}) {
  const params = await searchParams;

  let query = supabase
    .from("veiculos")
    .select("*")
    .eq("vendido", false)
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.marca) query = query.eq("marca", params.marca);
  if (params.preco_min) query = query.gte("preco", Number(params.preco_min));
  if (params.preco_max) query = query.lte("preco", Number(params.preco_max));
  if (params.busca) query = query.ilike("modelo", `%${params.busca}%`);

  const { data: veiculos } = await query;
  const { data: marcas } = await supabase.from("marcas").select("id, nome, logo_url").order("nome");

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero marcas={(marcas ?? []).map((m) => m.nome)} />

      {/* Diferenciais */}
      <section className="border-b border-gray-200" style={{ background: "#f8f9fa" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: "Veículos revisados", desc: "Todos com inspeção completa" },
              { icon: TrendingUp,  label: "Valorização do usado", desc: "Melhor avaliação do mercado" },
              { icon: CreditCard,  label: "Financiamento fácil", desc: "Condições especiais para você" },
              { icon: MessageCircle, label: "Suporte via WhatsApp", desc: "Atendimento personalizado" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={18} strokeWidth={1.5} className="shrink-0 mt-0.5" style={{ color: "#00B040" }} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navegação por marca */}
      {(marcas ?? []).length > 0 && (
        <section id="marcas" className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Procure por marca</p>
            <NavMarcas marcas={(marcas ?? []) as Marca[]} />
          </div>
        </section>
      )}

      {/* Estoque */}
      <section id="estoque" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 rounded-full" style={{ background: "#00B040" }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Estoque disponível</p>
              <h2 className="text-xl font-bold text-gray-900">
                {params.marca ? params.marca : "Todos os veículos"}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {veiculos?.length ?? 0} veículo{(veiculos?.length ?? 0) !== 1 ? "s" : ""} disponíve{(veiculos?.length ?? 0) !== 1 ? "is" : "l"}
              </p>
            </div>
          </div>
        </div>

        {veiculos && veiculos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {veiculos.map((v: Veiculo) => (
              <CardVeiculo key={v.id} veiculo={v} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <Car size={40} className="mx-auto mb-3 text-gray-300" strokeWidth={1.25} />
            <p className="font-semibold text-gray-600">Nenhum veículo encontrado</p>
            <p className="text-sm mt-1 text-gray-400">Tente outros filtros ou veja todo o estoque.</p>
            <a href="/" className="inline-block mt-4 text-sm font-semibold" style={{ color: "#00B040" }}>
              Ver todos os veículos →
            </a>
          </div>
        )}
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="bg-white border-t border-gray-200 py-14">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Atendimento</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ficou com dúvida?</h2>
          <p className="text-gray-500 text-sm mb-8">Nossa equipe está pronta para te ajudar a encontrar o veículo certo.</p>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3 rounded-xl text-sm cursor-pointer"
            style={{ background: "#00B040" }}
          >
            <Phone size={16} />
            Falar com a equipe MP
          </a>
        </div>
      </section>

      <footer className="py-5 border-t border-gray-200 text-center text-xs text-gray-400 bg-white">
        © {new Date().getFullYear()} MP Seminovos · Todos os direitos reservados
      </footer>
    </main>
  );
}
