import { ShieldCheck, TrendingUp, CreditCard, MessageCircle, Phone, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const diferenciais = [
  { icon: ShieldCheck,   label: "Veículos revisados",   desc: "Todos com inspeção completa" },
  { icon: TrendingUp,    label: "Valorização do usado",  desc: "Melhor avaliação do mercado" },
  { icon: CreditCard,    label: "Financiamento fácil",   desc: "Condições especiais para você" },
  { icon: MessageCircle, label: "Suporte via WhatsApp",  desc: "Atendimento personalizado" },
];

export default async function FooterSite() {
  const { data: config } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();

  const whatsapp = config?.whatsapp || "5531999561226";
  const nomeLoja = config?.nome_loja || "MP Seminovos";
  const endereco = config?.endereco || null;
  const horario = config?.horario || null;
  const primeiroNome = nomeLoja.split(" ")[0];

  return (
    <footer>
      {/* Diferenciais */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {diferenciais.map(({ icon: Icon, label, desc }) => (
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

      {/* CTA WhatsApp */}
      <section className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Atendimento</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ficou com dúvida?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Nossa equipe está pronta para te ajudar a encontrar o veículo certo.
          </p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3 rounded-xl text-sm"
            style={{ background: "#00B040" }}
          >
            <Phone size={16} />
            Falar com a equipe {primeiroNome}
          </a>

          {(endereco || horario) && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 text-gray-400 text-xs">
              {endereco && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="shrink-0" />
                  <span>{endereco}</span>
                </div>
              )}
              {horario && (
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="shrink-0" />
                  <span>{horario}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Copyright */}
      <div className="py-4 border-t border-gray-100 text-center text-xs text-gray-400 bg-white">
        © {new Date().getFullYear()} {nomeLoja} · Todos os direitos reservados
      </div>
    </footer>
  );
}
