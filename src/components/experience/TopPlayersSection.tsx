import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Zap, Calendar, Flame, TrendingUp } from 'lucide-react';
import type { TopPlayer } from '@/hooks/useExperienceData';

function SparklineSVG({ data, width = 120, height = 30, color = "#10b981" }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return <div className="text-xs text-[#5a5a6e]">—</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - ((val - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "same" }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (trend === "down") return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
  return <div className="w-4 h-4 text-[#5a5a6e]">—</div>;
}

export function TopPlayersSection({ players, orgName }: { players: TopPlayer[]; orgName: string }) {
  if (players.length === 0) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }} transition={{ duration: 0.8 }} 
      className="relative z-20 bg-[#0d0d14] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">{orgName} Elite</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Top <span className="text-emerald-400">Players</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {players.map((player, i) => (
            <motion.div key={player.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="group relative bg-[#12121a]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
              <div className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : player.rank === 2 ? 'bg-gray-400/20 text-gray-300' : player.rank === 3 ? 'bg-amber-600/20 text-amber-500' : 'bg-[#1a1a2e] text-[#5a5a6e]'}`}>{player.rank}</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Target className="w-5 h-5 text-emerald-400" /></div>
                <div className="min-w-0">
                  <Link to={`/jogador/${player.id}`} className="text-white font-bold text-sm truncate group-hover:text-emerald-400 transition-colors hover:underline">{player.name}</Link>
                  {player.teamId ? (
                    <Link to={`/clans/${player.clanId ?? 0}/line/${player.teamId}`} className="text-[#5a5a6e] text-xs hover:text-emerald-400 transition-colors block truncate">{player.teamName || "Sem time"}</Link>
                  ) : (
                    <p className="text-[#5a5a6e] text-xs">{player.teamName || "Sem time"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-black text-emerald-400">{player.kills}</span>
                <span className="text-[#5a5a6e] text-xs mb-1">kills</span>
              </div>
              <div className="flex gap-3 text-xs text-[#5a5a6e] mb-3">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> {player.avgKills} avg</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-violet-400" /> {player.participations} xtrs</span>
                {player.streak >= 3 && <span className="flex items-center gap-1 text-orange-400"><Flame className="w-3 h-3" /> {player.streak}</span>}
              </div>
              {player.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {player.badges.slice(0, 3).map((badge) => (
                    <span key={badge} className="px-2 py-0.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]">{badge}</span>
                  ))}
                </div>
              )}
              <div className="hidden sm:flex items-center justify-between">
                <SparklineSVG data={player.sparkline} width={100} height={24} />
                <TrendIcon trend={player.trend} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}