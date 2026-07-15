import { Link } from "react-router";
import { Shield, Users, UserCircle } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
      <div className="bg-gradient-to-r from-emerald-900/20 via-[#12121a] to-emerald-900/20 rounded-2xl border border-emerald-500/20 p-8 md:p-12 text-center relative overflow-hidden animate-pulse-glow">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-1/4 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6"><Shield className="w-8 h-8 text-emerald-400" /></div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">Pronto para competir?</h2>
          <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto">Cadastre sua equipe, participe de xtreinos e campeonatos, e suba no ranking da liga.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/clans" className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"><Users className="w-4 h-4" />Gerenciar Clans</Link>
            <Link to="/jogadores" className="px-8 py-3.5 rounded-xl bg-[#1a1a24] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-200 flex items-center justify-center gap-2"><UserCircle className="w-4 h-4" />Ver Jogadores</Link>
          </div>
        </div>
      </div>
    </section>
  );
}