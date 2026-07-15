import { useEffect, useRef, useState } from 'react';
import { motion, type Variants, useMotionValue, useSpring, type MotionStyle } from 'framer-motion';
import { Shield, Crosshair, Globe, Cpu } from 'lucide-react';
import { ScrambleText } from './Effects';

const features = [
  { icon: Crosshair, title: "Precisão Cirúrgica", desc: "Estatísticas milimétricas que revelam o verdadeiro potencial de cada jogador e equipe no cenário competitivo." },
  { icon: Shield, title: "Infraestrutura Sólida", desc: "Tecnologia de ponta garantindo estabilidade, velocidade e segurança absoluta dos dados." },
  { icon: Globe, title: "Cenário Conectado", desc: "Uma rede unindo jogadores, times e organizações em um ecossistema vivo e integrado." },
  { icon: Cpu, title: "Inteligência Aplicada", desc: "Algoritmos próprios para pontuação, ranking e análise de desempenho evolutiva." },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

// ============================================================================
// HOOK: Parallax 3D no Mouse (Desktop) e Giroscópio (Mobile)
// ============================================================================
function useTilt(factor = 20): { ref: React.RefObject<HTMLDivElement | null>; style: MotionStyle } {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(((e.clientX - centerX) / (window.innerWidth / 2)) * factor);
      y.set(((e.clientY - centerY) / (window.innerHeight / 2)) * factor);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      x.set((e.gamma / 45) * factor);
      y.set(((e.beta - 45) / 45) * factor);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [x, y, factor]);

  return { ref, style: { x: springX, y: springY } };
}

// ============================================================================
// COMPONENTE: HeroText com Tilt 3D
// ============================================================================
export function HeroText() {
  const { ref, style } = useTilt(15);
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const onScroll = () => window.scrollY > 50 ? setShowScroll(false) : setShowScroll(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={style}
      className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto will-change-transform"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" as const }}
        className="mb-6 sm:mb-8"
      >
        <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          A Nova Era do E-sports Mobile
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" as const }}
        className="text-[15vw] sm:text-[12vw] md:text-[8vw] lg:text-8xl font-black text-white leading-[0.85] sm:leading-[0.9] tracking-tighter mb-6 sm:mb-8"
        style={{ textShadow: "0 0 80px rgba(16, 185, 129, 0.5)" }}
      >
        MAIS QUE <br className="sm:hidden" />
        UM <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400">JOGO.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" as const }}
        className="text-base sm:text-lg md:text-xl text-[#6a6a7e] max-w-2xl mx-auto leading-relaxed px-2"
      >
        Uma experiência imersiva onde dados, competição e tecnologia se encontram para redefinir o cenário competitivo.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showScroll ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-[-60px] sm:bottom-[-80px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[#3a3a4e] text-[10px] tracking-[0.3em] uppercase">Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
          className="w-5 h-8 border-2 border-[#3a3a4e] rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-emerald-500 rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE: FeaturesGrid com Scramble Effect
// ============================================================================
export function FeaturesGrid() {
  const [scrambleTriggers, setScrambleTriggers] = useState<boolean[]>(new Array(features.length).fill(false));

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

// ============================================================================
// COMPONENTE: MantraSection
// ============================================================================
export function MantraSection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" as const }}
      viewport={{ once: true }}
      className="text-center py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h2
          className="text-[20vw] sm:text-[14vw] md:text-[8vw] font-black text-[#12121a]"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)' }}
        >
          EVOLUÇÃO
        </h2>
      </div>
      <div className="relative z-10 px-4">
        <p className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#f0f0f5] leading-tight max-w-4xl mx-auto tracking-tight">
          Não acompanhamos tendências. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">
            Nós criamos o futuro.
          </span>
        </p>
      </div>
    </motion.div>
  );
}