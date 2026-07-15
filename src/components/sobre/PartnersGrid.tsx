import { Handshake } from "lucide-react";

interface Partner {
  name: string;
  type: string;
  status: "ativo" | "em_breve";
}

const partners: Partner[] = [
  { name: "UGD Esports", type: "Clã Principal", status: "ativo" },
  { name: "K4F", type: "Clã Parceiro", status: "ativo" },
  { name: "Em Breve", type: "Patrocinador", status: "em_breve" },
];

export default function PartnersGrid() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-0">
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <div className="w-1 h-8 bg-emerald-500 rounded-full" />
        <h2 className="text-2xl font-bold text-[#f0f0f5]">Parceiros & Colaboradores</h2>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {partners.map((partner, idx) => (
          <div key={partner.name} className={`animate-fade-up delay-${(idx + 1) * 100} group relative bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden`}>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12 z-0 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Handshake className="w-6 h-6 text-emerald-400" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  partner.status === "ativo"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-[#1a1a24] text-[#5a5a6e] border border-[#2a2a3a]"
                }`}>
                  {partner.status === "ativo" ? "✓ Ativo" : "⏳ Em Breve"}
                </span>
              </div>
              <h4 className="text-[#f0f0f5] font-bold text-sm group-hover:text-emerald-400 transition-colors">{partner.name}</h4>
              <p className="text-[#5a5a6e] text-xs mt-1">{partner.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}