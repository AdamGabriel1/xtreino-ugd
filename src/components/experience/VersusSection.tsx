import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';

// Dados mockados para exemplo
const playersDB = [
  { id: 1, name: "ShadowKill", stats: [90, 60, 85, 70, 95] },
  { id: 2, name: "NightViper", stats: [75, 95, 80, 90, 70] },
  { id: 3, name: "CyberBlade", stats: [85, 85, 90, 60, 80] },
];

const statsLabels = ["Kills", "Precisão", "Vitórias", "Suportes", " Sobrevivência"];

function RadarChart({ stats, color, delay = 0 }: { stats: number[]; color: string; delay?: number }) {
  const size = 150;
  const center = size / 2;
  const radius = 60;
  const angles = stats.map((_, i) => (Math.PI * 2 * i) / stats.length - Math.PI / 2);

  const points = stats.map((val, i) => {
    const r = (val / 100) * radius;
    return `${center + r * Math.cos(angles[i])},${center + r * Math.sin(angles[i])}`;
  }).join(" ");

  const gridLines = [20, 40, 60, 80, 100].map((val) => {
    const r = (val / 100) * radius;
    const pts = angles.map((angle) => `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`).join(" ");
    return <polygon key={val} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 m-auto">
      {gridLines}
      {angles.map((angle, i) => (
        <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <motion.polygon
        points={points}
        fill={`${color}20`}
        stroke={color}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
      {points.split(" ").map((p, i) => (
        <motion.circle
          key={i}
          cx={p.split(",")[0]}
          cy={p.split(",")[1]}
          r="3"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 + i * 0.05 }}
        />
      ))}
    </svg>
  );
}

export function VersusSection() {
  const [p1, setP1] = useState(playersDB[0]);
  const [p2, setP2] = useState(playersDB[1]);
  const [activeKey, setActiveKey] = useState(0);

  const handleCompare = (id: number) => {
    if (p1.id !== id) {
      setP2(p1);
      setP1(playersDB.find(p => p.id === id) || p1);
    }
    setActiveKey(prev => prev + 1); // Força re-render da animação
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-violet-500/10 border border-violet-500/30 text-violet-400 mb-4">
          Estatísticas Avançadas
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-10">
          Head to <span className="text-violet-400">Head</span>
        </h2>

        {/* Seleção de Jogadores */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {playersDB.map((player) => (
            <button
              key={player.id}
              onClick={() => handleCompare(player.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 ${
                p1.id === player.id 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                  : 'bg-[#12121a] border-white/5 text-[#5a5a6e] hover:border-white/20 hover:text-white'
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>

        {/* Área do Gráfico */}
        <div className="relative h-[350px] sm:h-[400px] flex items-center justify-center mb-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-left hidden sm:block">
            <h3 className="text-xl font-black text-emerald-400 mb-2">{p1.name}</h3>
            <div className="space-y-1 text-xs text-[#5a5a6e]">
              {p1.stats.map((s, i) => <div key={i} className="flex gap-2"><span className="w-20">{statsLabels[i]}</span> <span className="text-white font-mono">{s}</span></div>)}
            </div>
          </div>

          <div key={activeKey} className="relative w-[200px] h-[200px]">
            <RadarChart stats={p2.stats} color="#8b5cf6" delay={0.1} />
            <RadarChart stats={p1.stats} color="#10b981" delay={0} />
            
            {/* VS Central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#0a0a0f] border border-white/10 rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg shadow-black/50">
                <Swords className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-right hidden sm:block">
            <h3 className="text-xl font-black text-violet-400 mb-2">{p2.name}</h3>
            <div className="space-y-1 text-xs text-[#5a5a6e]">
              {p2.stats.map((s, i) => <div key={i} className="flex gap-2 justify-end"><span className="font-mono text-white">{s}</span><span className="w-20">{statsLabels[i]}</span></div>)}
            </div>
          </div>
        </div>
        
        {/* Legendas Mobile */}
        <div className="flex sm:hidden justify-center gap-6 text-sm font-bold">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>{p1.name}</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500"></div>{p2.name}</div>
        </div>
      </div>
    </motion.section>
  );
}