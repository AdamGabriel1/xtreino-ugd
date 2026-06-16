"use client";

import { useMemo } from "react";
import { BarChart3, Target, Trophy, ChevronRight } from "lucide-react";
import { ScrimTable } from "../tables/ScrimTable";
import { DateFilter } from "../DateFilter";
import { EmptyState } from "../EmptyState";
import { HistorySummary } from "../HistorySummary";
import type {
  TeamResult,
  TeamAllTime,
  PlayerStat,
  EnrichedTeamRow,
} from "../../types";

interface HistoricoTimesTabProps {
  selectedDate: string;
  availableDates?: string[];
  onDateChange: (date: string) => void;
  scrimTeamResults?: TeamResult[];
  scrimPlayerStats?: PlayerStat[];
  scrimTeamAllTime?: TeamAllTime[];
  onTeamClick?: (teamName: string) => void;
}

export function HistoricoTimesTab({
  selectedDate,
  availableDates,
  onDateChange,
  scrimTeamResults,
  scrimPlayerStats,
  scrimTeamAllTime,
  onTeamClick,
}: HistoricoTimesTabProps) {
  const isAllTime = selectedDate === "all";

  const data = useMemo<EnrichedTeamRow[]>(() => {
    if (!isAllTime) {
      const teamsWithRounds = (scrimTeamResults || []).map((t) => {
        // Rounds ganhos = soma dos scores
        const roundWins = (t.q1Score || 0) + (t.q2Score || 0) + (t.q3Score || 0);
        // Quedas vencidas = posicao 1
        const quedaWins = [t.q1Pos, t.q2Pos, t.q3Pos].filter((p) => p === 1).length;

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
          points: roundWins + teamKills,
          roundWins: roundWins,
          kills: teamKills,
          wins: quedaWins,
          participations: 1,
          q1Pos: t.q1Pos,
          q2Pos: t.q2Pos,
          q3Pos: t.q3Pos,
          q1Score: t.q1Score,
          q2Score: t.q2Score,
          q3Score: t.q3Score,
        };
      });

      return teamsWithRounds.sort((a, b) => b.points - a.points);
    }

    return (scrimTeamAllTime || []).map((t, i) => ({
      id: i,
      entityName: t.teamName,
      points: t.totalRoundWins || 0,
      roundWins: t.totalRoundWins || 0,
      kills: t.totalKills || 0,
      wins: t.wins || 0,
      participations: t.matches || 0,
      q1Pos: null,
      q2Pos: null,
      q3Pos: null,
      q1Score: t.q1Wins || 0,
      q2Score: t.q2Wins || 0,
      q3Score: t.q3Wins || 0,
    }));
  }, [isAllTime, scrimTeamResults, scrimPlayerStats, scrimTeamAllTime, selectedDate]);

  const summary = useMemo(() => {
    return {
      totalTeams: data.length,
      totalKills: data.reduce((sum, t) => sum + (t.kills || 0), 0),
      totalPoints: data.reduce((sum, t) => sum + (t.roundWins || 0), 0),
      totalScrims: data.reduce((sum, t) => sum + (t.participations || 0), 0),
    };
  }, [data]);

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

      <ScrimTable
        data={data}
        keyExtractor={(row) => row.id}
        emptyState={
          <EmptyState
            icon={<BarChart3 className="w-12 h-12" />}
            title="Nenhum dado disponível"
            subtitle={
              isAllTime
                ? "Nenhum dado histórico encontrado"
                : "Nenhum dado para o filtro selecionado"
            }
          />
        }
        columns={[
          {
            key: "team",
            header: "Equipe",
            cell: (row) => (
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
            cell: (row) => (
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
            cell: (row) => (
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
                <Trophy className="w-3 h-3" /> Wins
              </span>
            ),
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] text-center block">
                {row.wins ?? 0}
              </span>
            ),
            className: "text-center",
          },
          {
            key: "participations",
            header: "Scrims",
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] text-center block">
                {row.participations ?? 0}
              </span>
            ),
            className: "text-center",
          },
          {
            key: "q",
            header: isAllTime ? "Q1 / Q2 / Q3 (wins)" : "Q1 / Q2 / Q3 (score)",
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] font-mono text-center block">
                {!isAllTime
                  ? `${row.q1Score || 0} / ${row.q2Score || 0} / ${row.q3Score || 0}`
                  : `${row.q1Score || 0} / ${row.q2Score || 0} / ${row.q3Score || 0}`}
              </span>
            ),
            className: "text-center",
          },
        ]}
      />
    </div>
  );
}