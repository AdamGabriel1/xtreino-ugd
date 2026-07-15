import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, Crown, TrendingUp } from 'lucide-react';
import type { TopTeam } from '@/hooks/useExperienceData';

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

export function TopTeamsSection({ teams, orgName }: { teams: TopTeam[]; orgName: string }) {
  if (teams.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">{orgName} Rankings</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Top <span className="text-emerald-400">Equipes</span></h2>
        </div>
        <div className="space-y-3">
          {teams.map((team, i) => (
            <motion.div key={team.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} whileHover={{ x: 4, transition: { duration: 0.2 } }} className="group flex items-center gap-4 bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${team.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : team.rank === 2 ? 'bg-gray-400/20 text-gray-300' : team.rank === 3 ? 'bg-amber-600/20 text-amber-500' : 'bg-[#1a1a2e] text-[#5a5a6e]'}`}>{team.rank}</div>
              <div className="flex-1 min-w-0">
                <Link to={`/clans/${team.clanId ?? 0}/line/${team.id}`} className="text-white font-bold text-sm sm:text-base truncate group-hover:text-emerald-400 transition-colors hover:underline block">{team.name}</Link>
                <div className="flex gap-3 text-xs text-[#5a5a6e] mt-0.5">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {team.wins} wins</span>
                  <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-violet-400" /> {team.top3Count} podiums</span>
                  {team.badges.slice(0, 2).map((badge) => (
                    <span key={badge} className="px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px]">{badge}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="text-center hidden sm:block">
                  <div className="text-emerald-400 font-black text-lg">{team.kills}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">kills</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-black text-xl">{team.points.toLocaleString('pt-BR')}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">pts</div>
                </div>
                <div className="text-center hidden md:block">
                  <div className="text-cyan-400 font-bold">{team.avgPoints}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">avg</div>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <SparklineSVG data={team.sparkline} width={80} height={24} color="#8b5cf6" />
                  <TrendIcon trend={team.trend} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}