const frases = [
  "Valorizamos seu usado na troca",
  "Financiamento com as melhores taxas do mercado",
  "Todos os veículos revisados e com garantia",
  "Atendimento personalizado via WhatsApp",
  "Parcelas que cabem no seu bolso",
  "Mais de 18 veículos disponíveis no estoque",
  "Seu próximo carro está aqui",
];

export default function TickerBar() {
  const items = [...frases, ...frases]; // duplicado para loop contínuo

  return (
    <div
      className="overflow-hidden border-y border-green-800 py-2.5"
      style={{ background: "#002810" }}
    >
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 45s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-track">
        {items.map((frase, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="text-white/90 text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap px-6">
              {frase}
            </span>
            <span className="text-green-500 text-[8px]">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
