"use client";

import { useMemo } from "react";
import { BarChart3, Target, Trophy, ChevronRight, Zap, Users } from "lucide-react";
import { ScrimTable } from "../tables/ScrimTable";
import { DateFilter } from "../DateFilter";
import { EmptyState } from "../EmptyState";
import { HistorySummary } from "../HistorySummary";
import type {
  TeamResult,
  TeamAllTimeBR,
  TeamAllTimeMME,
  PlayerStat,
  EnrichedTeamRowBR,
  EnrichedTeamRowMME,
  ScrimMode,
} from "../../types";

interface HistoricoTimesTabProps {
  selectedDate: string;
  availableDates?: string[];
  onDateChange: (date: string) => void;
  selectedMode: ScrimMode | "all";
  scrimTeamResults?: TeamResult[];
  scrimPlayerStats?: PlayerStat[];
  scrimTeamAllTimeBR?: TeamAllTimeBR[];
  scrimTeamAllTimeMME?: TeamAllTimeMME[];
  onTeamClick?: (teamName: string) => void;
}

export function HistoricoTimesTab({
  selectedDate,
  availableDates,
  onDateChange,
  selectedMode,
  scrimTeamResults,
  scrimPlayerStats,
  scrimTeamAllTimeBR,
  scrimTeamAllTimeMME,
  onTeamClick,
}: HistoricoTimesTabProps) {
  const isAllTime = selectedDate === "all";
  const isMME = selectedMode === "mme";
  const isBR = selectedMode === "br";
  const isAllModes = selectedMode === "all";

  // ============================================================
  // DADOS BR (Battle Royale)
  // ============================================================
  const dataBR = useMemo<EnrichedTeamRowBR[]>(() => {
    if (isMME) return [];

    if (!isAllTime) {
      const teamsWithPoints = (scrimTeamResults || [])
        // 🔒 FILTRO DE SEGURANÇA: só incluir se tiver pelo menos uma posição (BR)
        // Isso previne que dados MME vazem para a seção BR
        .filter((t) => t.q1Pos !== null || t.q2Pos !== null || t.q3Pos !== null)
        .map((t) => {
          const q1Points = getPointsByPosition(t.q1Pos);
          const q2Points = getPointsByPosition(t.q2Pos);
          const q3Points = getPointsByPosition(t.q3Pos);
          const positionPoints = q1Points + q2Points + q3Points;

          const playerData = (scrimPlayerStats || []).filter(
            (p) => p.teamName === t.teamName && p.date === selectedDate
          );
          const teamKills = playerData.reduce(
            (sum, p) => sum + (p.totalKills || 0),
            0
          );

          const positions = [t.q1Pos, t.q2Pos, t.q3Pos].filter((p): p is number => p !== null);
          const wins = positions.filter(p => p === 1).length;
          const top3 = positions.filter(p => p && p <= 3).length;

          return {
            id: t.id,
            entityName: t.teamName,
            points: positionPoints + teamKills,
            positionPoints,
            kills: teamKills,
            wins,
            top3,
            participations: 1,
            q1Pos: t.q1Pos,
            q2Pos: t.q2Pos,
            q3Pos: t.q3Pos,
          };
        });

      return teamsWithPoints.sort((a, b) => b.points - a.points);
    }

    return (scrimTeamAllTimeBR || []).map((t, i) => ({
      id: i,
      entityName: t.teamName,
      points: (t.totalPoints || 0) + (t.totalKills || 0),
      positionPoints: t.totalPoints || 0,
      kills: t.totalKills || 0,
      wins: t.wins || 0,
      top3: t.top3 || 0,
      participations: t.matches || 0,
      q1Pos: null,
      q2Pos: null,
      q3Pos: null,
    }));
  }, [isAllTime, isMME, scrimTeamResults, scrimPlayerStats, scrimTeamAllTimeBR, selectedDate]);

  // ============================================================
  // DADOS MME (Mata-Mata em Equipe)
  // ============================================================
  const dataMME = useMemo<EnrichedTeamRowMME[]>(() => {
    if (isBR) return [];

    if (!isAllTime) {
      const teamsWithRounds = (scrimTeamResults || [])
        // 🔒 FILTRO DE SEGURANÇA: só incluir se tiver pelo menos um score (MME)
        // Isso previne que dados BR vazem para a seção MME
        .filter((t) => t.q1Score !== null || t.q2Score !== null || t.q3Score !== null)
        .map((t) => {
          const roundWins = (t.q1Score || 0) + (t.q2Score || 0) + (t.q3Score || 0)
            + (t.q4Score || 0) + (t.q5Score || 0) + (t.q6Score || 0) + (t.q7Score || 0);

          const playerData = (scrimPlayerStats || []).filter(
            (p) => p.teamName === t.teamName && p.date === selectedDate
          );
          const teamKills = playerData.reduce(
            (sum, p) => sum + (p.totalKills || 0),
            0
          );

          return {
            id: t.id,
            entityName: t.teamName,
            roundWins,
            kills: teamKills,
            seriesWins: roundWins > 0 ? 1 : 0,
            participations: 1,
            q1Score: t.q1Score,
            q2Score: t.q2Score,
            q3Score: t.q3Score,
            q4Score: t.q4Score,
            q5Score: t.q5Score,
            q6Score: t.q6Score,
            q7Score: t.q7Score,
          };
        });

      return teamsWithRounds.sort((a, b) => b.roundWins - a.roundWins);
    }

    return (scrimTeamAllTimeMME || []).map((t, i) => ({
      id: i,
      entityName: t.teamName,
      roundWins: t.totalRoundWins || 0,
      kills: t.totalKills || 0,
      seriesWins: t.seriesWins || 0,
      participations: t.matches || 0,
      q1Score: null,
      q2Score: null,
      q3Score: null,
      q4Score: null,
      q5Score: null,
      q6Score: null,
      q7Score: null,
    }));
  }, [isAllTime, isBR, scrimTeamResults, scrimPlayerStats, scrimTeamAllTimeMME, selectedDate]);

  // ============================================================
  // SUMMARY
  // ============================================================
  const summary = useMemo(() => {
    if (isMME) {
      return {
        totalTeams: dataMME.length,
        totalKills: dataMME.reduce((sum, t) => sum + (t.kills || 0), 0),
        totalPoints: dataMME.reduce((sum, t) => sum + (t.roundWins || 0), 0),
        totalScrims: dataMME.reduce((sum, t) => sum + (t.participations || 0), 0),
      };
    }
    return {
      totalTeams: dataBR.length,
      totalKills: dataBR.reduce((sum, t) => sum + (t.kills || 0), 0),
      totalPoints: dataBR.reduce((sum, t) => sum + (t.positionPoints || 0), 0),
      totalScrims: dataBR.reduce((sum, t) => sum + (t.participations || 0), 0),
    };
  }, [dataBR, dataMME, isMME]);

  // ============================================================
  // COLUNAS BR
  // ============================================================
  const columnsBR = [
    {
      key: "team",
      header: "Equipe",
      cell: (row: EnrichedTeamRowBR) => (
        <button
          onClick={() => onTeamClick?.(row.entityName)}
          className="text-sm font-bold text-[#f0f0f5] hover:text-emerald-400 transition-colors flex items-center gap-1 group"
        >
          {row.entityName}
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
    },
    {
      key: "points",
      header: (
        <span className="flex items-center justify-center gap-1">
          <Zap className="w-3 h-3" /> Pontos
        </span>
      ),
      cell: (row: EnrichedTeamRowBR) => (
        <span className="text-sm font-bold text-emerald-400 text-center block">
          {row.points ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "kills",
      header: (
        <span className="flex items-center justify-center gap-1">
          <Target className="w-3 h-3" /> Kills
        </span>
      ),
      cell: (row: EnrichedTeamRowBR) => (
        <span className="text-sm text-[#8a8a9e] text-center block">
          {row.kills ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "wins",
      header: (
        <span className="flex items-center justify-center gap-1">
          <Trophy className="w-3 h-3" /> 1º Lugares
        </span>
      ),
      cell: (row: EnrichedTeamRowBR) => (
        <span className="text-sm text-yellow-400 text-center block font-medium">
          {row.wins ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "top3",
      header: "Top 3",
      cell: (row: EnrichedTeamRowBR) => (
        <span className="text-sm text-[#8a8a9e] text-center block">
          {row.top3 ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "participations",
      header: "Scrims",
      cell: (row: EnrichedTeamRowBR) => (
        <span className="text-sm text-[#8a8a9e] text-center block">
          {row.participations ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "q",
      header: isAllTime ? "Média Pos" : "Q1 / Q2 / Q3",
      cell: (row: EnrichedTeamRowBR) => (
        <span className="text-sm text-[#8a8a9e] font-mono text-center block">
          {isAllTime
            ? "—"
            : `${row.q1Pos ?? "—"} / ${row.q2Pos ?? "—"} / ${row.q3Pos ?? "—"}`}
        </span>
      ),
      className: "text-center",
    },
  ];

  // ============================================================
  // COLUNAS MME
  // ============================================================
  const columnsMME = [
    {
      key: "team",
      header: "Equipe",
      cell: (row: EnrichedTeamRowMME) => (
        <button
          onClick={() => onTeamClick?.(row.entityName)}
          className="text-sm font-bold text-[#f0f0f5] hover:text-emerald-400 transition-colors flex items-center gap-1 group"
        >
          {row.entityName}
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
    },
    {
      key: "roundWins",
      header: (
        <span className="flex items-center justify-center gap-1">
          <BarChart3 className="w-3 h-3" /> Rounds
        </span>
      ),
      cell: (row: EnrichedTeamRowMME) => (
        <span className="text-sm font-bold text-emerald-400 text-center block">
          {row.roundWins ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "kills",
      header: (
        <span className="flex items-center justify-center gap-1">
          <Target className="w-3 h-3" /> Kills
        </span>
      ),
      cell: (row: EnrichedTeamRowMME) => (
        <span className="text-sm text-[#8a8a9e] text-center block">
          {row.kills ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "seriesWins",
      header: (
        <span className="flex items-center justify-center gap-1">
          <Trophy className="w-3 h-3" /> Séries
        </span>
      ),
      cell: (row: EnrichedTeamRowMME) => (
        <span className="text-sm text-yellow-400 text-center block font-medium">
          {row.seriesWins ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "participations",
      header: "Scrims",
      cell: (row: EnrichedTeamRowMME) => (
        <span className="text-sm text-[#8a8a9e] text-center block">
          {row.participations ?? 0}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "q",
      header: isAllTime ? "Total Rounds" : "Q1 / Q2 / Q3 / Q4 / Q5 / Q6 / Q7",
      cell: (row: EnrichedTeamRowMME) => (
        <span className="text-sm text-[#8a8a9e] font-mono text-center block">
          {isAllTime
            ? row.roundWins ?? 0
            : `${row.q1Score ?? 0} / ${row.q2Score ?? 0} / ${row.q3Score ?? 0} / ${row.q4Score ?? 0} / ${row.q5Score ?? 0} / ${row.q6Score ?? 0} / ${row.q7Score ?? 0}`}
        </span>
      ),
      className: "text-center",
    },
  ];

  const emptyStateBR = (
    <EmptyState
      icon={<Target className="w-12 h-12" />}
      title="Nenhum dado BR"
      subtitle={
        isAllTime
          ? "Nenhum dado histórico de Battle Royale encontrado"
          : "Nenhum dado de Battle Royale para o filtro selecionado"
      }
    />
  );

  const emptyStateMME = (
    <EmptyState
      icon={<Users className="w-12 h-12" />}
      title="Nenhum dado MME"
      subtitle={
        isAllTime
          ? "Nenhum dado histórico de Mata-Mata em Equipe encontrado"
          : "Nenhum dado de Mata-Mata em Equipe para o filtro selecionado"
      }
    />
  );

  // Só mostra a seção BR se: modo é BR ou (modo é "all" E há dados BR)
  const showBR = isBR || (isAllModes && dataBR.length > 0);
  // Só mostra a seção MME se: modo é MME ou (modo é "all" E há dados MME)
  const showMME = isMME || (isAllModes && dataMME.length > 0);

  return (
    <div className="space-y-6">
      <DateFilter
        selectedDate={selectedDate}
        availableDates={availableDates}
        onChange={onDateChange}
      />

      <HistorySummary
        totalTeams={summary.totalTeams}
        totalKills={summary.totalKills}
        totalPoints={summary.totalPoints}
        totalScrims={summary.totalScrims}
      />

      {/* BR Section */}
      {showBR && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-[#2a2a3a]">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0f0f5]">Battle Royale</h3>
              <p className="text-xs text-[#5a5a6e]">
                {dataBR.length > 0 
                  ? `${dataBR.length} equipe(s)` 
                  : "Nenhuma equipe nesta data"}
              </p>
            </div>
          </div>
          <ScrimTable
            data={dataBR}
            keyExtractor={(row) => row.id}
            emptyState={emptyStateBR}
            columns={columnsBR}
          />
        </div>
      )}

      {/* MME Section */}
      {showMME && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-[#2a2a3a]">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0f0f5]">Mata-Mata em Equipe</h3>
              <p className="text-xs text-[#5a5a6e]">
                {dataMME.length > 0 
                  ? `${dataMME.length} equipe(s)` 
                  : "Nenhuma equipe nesta data"}
              </p>
            </div>
          </div>
          <ScrimTable
            data={dataMME}
            keyExtractor={(row) => row.id}
            emptyState={emptyStateMME}
            columns={columnsMME}
          />
        </div>
      )}
    </div>
  );
}

function getPointsByPosition(pos: number | null): number {
  if (!pos) return 0;
  const points: Record<number, number> = {
    1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7,
    7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
    13: 1, 14: 0, 15: 0,
  };
  return points[pos] ?? 0;
}