import { ShieldCheck, TrendingUp, CreditCard, MessageCircle, Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { supabase } from "@/lib/supabase";

const diferenciais = [
  { icon: ShieldCheck,   label: "Veículos revisados",   desc: "Todos com inspeção completa" },
  { icon: TrendingUp,    label: "Valorização do usado",  desc: "Melhor avaliação do mercado" },
  { icon: CreditCard,    label: "Financiamento fácil",   desc: "Condições especiais para você" },
  { icon: MessageCircle, label: "Suporte via WhatsApp",  desc: "Atendimento personalizado" },
];

function instagramUrl(val: string) {
  if (!val) return null;
  if (val.startsWith("http")) return val;
  return `https://instagram.com/${val.replace("@", "")}`;
}

function facebookUrl(val: string) {
  if (!val) return null;
  if (val.startsWith("http")) return val;
  return `https://facebook.com/${val.replace("@", "")}`;
}

export default async function FooterSite() {
  const { data: config } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();

  const whatsapp  = config?.whatsapp  || "5531999561226";
  const nomeLoja  = config?.nome_loja || "MP Seminovos";
  const endereco  = config?.endereco  || null;
  const horario   = config?.horario   || null;
  const instagram = config?.instagram ? instagramUrl(config.instagram) : null;
  const facebook  = config?.facebook  ? facebookUrl(config.facebook)  : null;
  const primeiroNome = nomeLoja.split(" ")[0];

  const mapsUrl = endereco
    ? `https://www.google.com/maps?q=${encodeURIComponent(endereco)}&output=embed`
    : null;

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

      {/* Mapa + Info */}
      {mapsUrl && (
        <section className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Mapa */}
              <div className="md:col-span-2 h-64 md:h-72">
                <iframe
                  src={mapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização"
                />
              </div>

              {/* Info lateral */}
              <div className="flex flex-col justify-center gap-5 px-8 py-8 bg-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#00B040" }}>
                    Como chegar
                  </p>
                  {endereco && (
                    <div className="flex items-start gap-2 text-gray-700 text-sm">
                      <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: "#00B040" }} />
                      <span>{endereco}</span>
                    </div>
                  )}
                  {horario && (
                    <div className="flex items-start gap-2 text-gray-700 text-sm mt-3">
                      <Clock size={14} className="shrink-0 mt-0.5" style={{ color: "#00B040" }} />
                      <span>{horario}</span>
                    </div>
                  )}
                </div>

                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm self-start"
                  style={{ background: "#00B040" }}
                >
                  <Phone size={14} />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA WhatsApp (só aparece se não tem mapa) */}
      {!mapsUrl && (
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
            {horario && (
              <div className="mt-6 flex items-center justify-center gap-1.5 text-gray-400 text-xs">
                <Clock size={12} />
                <span>{horario}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Copyright + redes sociais + Audis */}
      <div className="py-4 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {nomeLoja} · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-4">
            {(instagram || facebook) && (
              <div className="flex items-center gap-3">
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                    <Instagram size={16} />
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                    <Facebook size={16} />
                  </a>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400">
              Feito pela{" "}
              <a href="https://audis.online" target="_blank" rel="noopener noreferrer"
                className="font-bold cursor-pointer" style={{ color: "#7c3aed" }}>
                AUDIS
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
