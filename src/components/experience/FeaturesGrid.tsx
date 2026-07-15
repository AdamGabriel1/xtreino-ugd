import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Shield, Crosshair, Globe, Cpu } from 'lucide-react';
// ✅ CORREÇÃO: Importar do novo local
import { ScrambleText } from '@/components/shared/effects';

const features = [
  { 
    icon: Crosshair, 
    title: "Precisão Cirúrgica", 
    desc: "Estatísticas milimétricas que revelam o verdadeiro potencial de cada jogador e equipe no cenário competitivo." 
  },
  { 
    icon: Shield, 
    title: "Infraestrutura Sólida", 
    desc: "Tecnologia de ponta garantindo estabilidade, velocidade e segurança absoluta dos dados." 
  },
  { 
    icon: Globe, 
    title: "Cenário Conectado", 
    desc: "Uma rede unindo jogadores, times e organizações em um ecossistema vivo e integrado." 
  },
  { 
    icon: Cpu, 
    title: "Inteligência Aplicada", 
    desc: "Algoritmos próprios para pontuação, ranking e análise de desempenho evolutiva." 
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function FeaturesGrid() {
  const [scrambleTriggers, setScrambleTriggers] = useState<boolean[]>(
    new Array(features.length).fill(false)
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      onViewportEnter={() => {
        features.forEach((_, i) => {
          setTimeout(() => {
            setScrambleTriggers(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, i * 150);
        });
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] overflow-hidden h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 transition-all duration-500" />
            <div className="relative z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <h3 className="text-[#f0f0f5] font-bold text-base sm:text-lg mb-2 group-hover:text-emerald-400 transition-colors font-mono">
                <ScrambleText text={feature.title} trigger={scrambleTriggers[index]} />
              </h3>
              <p className="text-[#5a5a6e] text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}