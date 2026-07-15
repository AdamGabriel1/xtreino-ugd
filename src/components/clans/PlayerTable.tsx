import { useState, useMemo } from "react";
import { Crown, Target, RotateCcw, Trophy, Filter } from "lucide-react";
import type { EnrichedPlayerItem, PlayerSortField, PlayerSortDir } from "@/types/clans";
import PlayerSortHeader from "./PlayerSortHeader";
import PlayerCardMobile from "./PlayerCardMobile";
import { formatDateBR } from "@/utils/date";

interface PlayerTableProps {
  players: EnrichedPlayerItem[];
  sortField: PlayerSortField;
  sortDir: PlayerSortDir;
  onSort: (field: PlayerSortField) => void;
  onPlayerClick: (playerId: number) => void;
  isSingleXtreino: boolean;
  selectedDate?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "captain": return <Crown className="w-3.5 h-3.5 text-yellow-400" />;
    case "official": return <Target className="w-3.5 h-3.5 text-blue-400" />;
    case "reserve": return <RotateCcw className="w-3.5 h-3.5 text-[#5a5a6e]" />;
    default: return null;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) { case "captain": return "Capitão"; case "official": return "Titular"; case "reserve": return "Reserva"; default: return role; }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "captain": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "official": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "reserve": return "text-[#5a5a6e] bg-[#1a1a24] border-[#2a2a3a]";
    default: return "text-[#5a5a6e]";
  }
};

type RoleFilter = "all" | "official" | "captain" | "reserve";

export default function PlayerTable({ players, sortField, sortDir, onSort, onPlayerClick, isSingleXtreino, selectedDate }: PlayerTableProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const sortedPlayers = useMemo(() => {
    let filtered = players;
    if (roleFilter !== "all") {
      filtered = players.filter(p => p.role === roleFilter);
    }

    return [...filtered].sort((a, b) => {
      const aVal = (a[sortField] as number) ?? 0;
      const bVal = (b[sortField] as number) ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [players, sortField, sortDir, roleFilter]);

  const mvpNickname = useMemo(() => {
    if (!isSingleXtreino || players.length === 0) return null;
    const mvp = players.reduce((max, p) => p.totalXtreinoKills > max.totalXtreinoKills ? p : max, players[0]);
    return mvp.totalXtreinoKills > 0 ? mvp.nickname : null;
  }, [players, isSingleXtreino]);

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a2a3a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
          Elenco Completo
          {isSingleXtreino && selectedDate && (
            <span className="text-sm font-normal text-[#5a5a6e]">— {formatDateBR(selectedDate)}</span>
          )}
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#5a5a6e]">
            <Filter className="w-3 h-3" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] focus:outline-none"
            >
              <option value="all">Todas Roles</option>
              <option value="captain">Capitão</option>
              <option value="official">Titular</option>
              <option value="reserve">Reserva</option>
            </select>
          </div>
          <span className="text-xs text-[#5a5a6e]">{sortedPlayers.length} jogadores</span>
        </div>
      </div>

      {/* TABELA (Apenas Desktop) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase w-16">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Role</th>
              <th className="px-6 py-3 text-center"><PlayerSortHeader field="totalXtreinoKills" label="Kills XT" currentField={sortField} currentDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3 text-center"><PlayerSortHeader field="q1Kills" label="Q1" currentField={sortField} currentDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3 text-center"><PlayerSortHeader field="q2Kills" label="Q2" currentField={sortField} currentDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3 text-center"><PlayerSortHeader field="q3Kills" label="Q3" currentField={sortField} currentDir={sortDir} onSort={onSort} /></th>
              {!isSingleXtreino && (
                <>
                  <th className="px-6 py-3 text-center"><PlayerSortHeader field="participations" label="XTreinos" currentField={sortField} currentDir={sortDir} onSort={onSort} /></th>
                  <th className="px-6 py-3 text-center"><PlayerSortHeader field="avgKills" label="Média" currentField={sortField} currentDir={sortDir} onSort={onSort} /></th>
                </>
              )}
              <th className="px-6 py-3 text-center"><PlayerSortHeader field="killPoints" label="Pts" currentField={sortField} currentDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3a]">
            {sortedPlayers.map((p, i) => {
              const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills > 0 ? p.kills.toString() : "0";
              const isMVP = p.nickname === mvpNickname;
              return (
                <tr
                  key={p.id}
                  className={`${i < 3 && !isMVP ? "bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-400" : ""} 
                             ${isMVP ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-400" : ""} 
                             hover:bg-[#1a1a24] cursor-pointer transition-colors`}
                  onClick={() => onPlayerClick(p.id)}
                >
                  <td className="px-6 py-3 text-sm font-bold text-[#5a5a6e] text-center">{i + 1}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(p.role)}
                      <span className={`text-sm font-medium ${p.role === "captain" ? "text-yellow-400" : "text-[#f0f0f5]"}`}>{p.nickname}</span>
                      {isMVP && <Trophy className="w-4 h-4 text-yellow-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRoleColor(p.role)}`}>{getRoleLabel(p.role)}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-center font-bold text-emerald-400">{p.totalXtreinoKills}</td>
                  <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q1Kills}</td>
                  <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q2Kills}</td>
                  <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q3Kills}</td>
                  {!isSingleXtreino && (
                    <>
                      <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.participations}</td>
                      <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.avgKills}</td>
                    </>
                  )}
                  <td className="px-6 py-3 text-sm text-center text-emerald-400">{p.killPoints}</td>
                  <td className="px-6 py-3 text-sm text-center text-red-400 font-bold">{kd}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CARDS (Apenas Mobile) */}
      <div className="lg:hidden p-4 space-y-3">
        {sortedPlayers.map((p) => (
          <PlayerCardMobile
            key={p.id}
            player={p}
            isMVP={p.nickname === mvpNickname}
            isSingleXtreino={isSingleXtreino}
            onClick={() => onPlayerClick(p.id)}
          />
        ))}
      </div>
    </div>
  );
}