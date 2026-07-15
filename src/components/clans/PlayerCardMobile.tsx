import { Crown, Target, RotateCcw, Trophy } from "lucide-react";
import type { EnrichedPlayerItem } from "@/types/clans";

interface PlayerCardMobileProps {
  player: EnrichedPlayerItem;
  isMVP: boolean;
  isSingleXtreino: boolean;
  onClick: () => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "captain": return <Crown className="w-4 h-4 text-yellow-400" />;
    case "official": return <Target className="w-4 h-4 text-blue-400" />;
    case "reserve": return <RotateCcw className="w-4 h-4 text-[#5a5a6e]" />;
    default: return null;
  }
};

export default function PlayerCardMobile({ player, isMVP, isSingleXtreino, onClick }: PlayerCardMobileProps) {
  const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills > 0 ? player.kills.toString() : "0";

  return (
    <div 
      onClick={onClick}
      className={`bg-[#12121a] rounded-xl border p-4 cursor-pointer transition-all ${
        isMVP ? "border-yellow-400/50 bg-yellow-400/5" : "border-[#2a2a3a] hover:border-emerald-500/30"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getRoleIcon(player.role)}
          <span className={`font-bold ${player.role === "captain" ? "text-yellow-400" : "text-[#f0f0f5]"}`}>
            {player.nickname}
          </span>
          {isMVP && <Trophy className="w-4 h-4 text-yellow-400" />}
        </div>
        <span className="text-sm font-bold text-red-400">K/D: {kd}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-[#5a5a6e]">Kills</p>
          <p className="text-lg font-bold text-emerald-400">{player.totalXtreinoKills}</p>
        </div>
        <div>
          <p className="text-xs text-[#5a5a6e]">Q1 / Q2 / Q3</p>
          <p className="text-sm text-[#8a8a9e]">{player.q1Kills} / {player.q2Kills} / {player.q3Kills}</p>
        </div>
        <div>
          <p className="text-xs text-[#5a5a6e]">Pts</p>
          <p className="text-lg font-bold text-[#f0f0f5]">{player.killPoints}</p>
        </div>
      </div>
      
      {!isSingleXtreino && (
        <div className="mt-2 pt-2 border-t border-[#2a2a3a] flex justify-between text-xs text-[#5a5a6e]">
          <span>Participações: {player.participations}</span>
          <span>Média: {player.avgKills}</span>
        </div>
      )}
    </div>
  );
}