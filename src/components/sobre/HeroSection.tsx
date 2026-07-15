import { Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_60%)]" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          Conheça nossa história
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight text-glow">
          <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
            Underground
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-[#8a8a9e] mb-4 max-w-2xl mx-auto leading-relaxed">
          Somos uma organização dedicada ao cenário competitivo mobile.
        </p>
        <p className="text-base text-[#6a6a7e] max-w-xl mx-auto">
          Nosso objetivo é criar o melhor ambiente para xtreinos, campeonatos e scrims
          com profissionalismo e paixão pelo game.
        </p>
      </div>
    </section>
  );
}