import { Link } from "react-router-dom"; // ✅ CORREÇÃO: react-router-dom
import { Zap, Users, Gamepad2 } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16 animate-fade-up">
      <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        
        {/* Chromatic Aberration Top */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[chromatic-move_3s_linear_infinite] z-20" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)]" />
        <div className="absolute top-0 right-1/3 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 md:p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-float-slow">
            <Zap className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">
            Quer fazer parte da UGD?
          </h2>
          <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto leading-relaxed">
            Seja como jogador, organizador ou parceiro, temos espaço para quem
            quer ajudar a construir o melhor cenário mobile competitivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/clans"
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Junte-se a uma Equipe
            </Link>
            <Link
              to="/xtreinos"
              className="px-8 py-3.5 rounded-xl bg-[#1a1a24] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-[#12121a] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              Participar de XTreinos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}