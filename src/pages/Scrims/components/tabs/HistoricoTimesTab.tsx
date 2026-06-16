"use client";

import { useMemo } from "react";
import { BarChart3, Target, Trophy, ChevronRight } from "lucide-react";
import { ScrimTable } from "../tables/ScrimTable";
import { DateFilter } from "../DateFilter";
import { EmptyState } from "../EmptyState";
import { HistorySummary } from "../HistorySummary";
import {
  type TeamResult,
  type TeamAllTime,
  type PlayerStat,
  type EnrichedTeamRow,
  getPointsByPosition,
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
      const teamsWithPoints = (scrimTeamResults || []).map((t) => {
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

        return {
          id: t.id,
          entityName: t.teamName,
          points: positionPoints + teamKills,
          positionPoints,
          kills: teamKills,
          wins: [t.q1Pos, t.q2Pos, t.q3Pos].filter((p) => p === 1).length,
          participations: 1,
          q1Pos: t.q1Pos,
          q2Pos: t.q2Pos,
          q3Pos: t.q3Pos,
          q1Points,
          q2Points,
          q3Points,
        };
      });

      return teamsWithPoints.sort((a, b) => b.points - a.points);
    }

    return (scrimTeamAllTime || []).map((t, i) => ({
      id: i,
      entityName: t.teamName,
      points: t.totalPoints || 0,
      positionPoints: t.totalPoints || 0,
      kills: t.totalKills || 0,
      wins: t.wins || 0,
      participations: t.matches || 0,
      q1Pos: t.avgQ1,
      q2Pos: t.avgQ2,
      q3Pos: t.avgQ3,
      q1Points: 0,
      q2Points: 0,
      q3Points: 0,
    }));
  }, [isAllTime, scrimTeamResults, scrimPlayerStats, scrimTeamAllTime, selectedDate]);

  const summary = useMemo(() => {
    return {
      totalTeams: data.length,
      totalKills: data.reduce((sum, t) => sum + (t.kills || 0), 0),
      totalPoints: data.reduce((sum, t) => sum + (t.positionPoints || 0), 0),
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
            key: "points",
            header: (
              <span className="flex items-center justify-center gap-1">
                <BarChart3 className="w-3 h-3" /> Pontos
              </span>
            ),
            cell: (row) => (
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
            header: isAllTime ? "Média Q1 / Q2 / Q3" : "Q1 / Q2 / Q3 (pts)",
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] font-mono text-center block">
                {!isAllTime
                  ? `${row.q1Pos}(${row.q1Points}) / ${row.q2Pos}(${row.q2Points}) / ${row.q3Pos}(${row.q3Points})`
                  : `${row.q1Pos?.toFixed(1) || "-"} / ${row.q2Pos?.toFixed(1) || "-"} / ${row.q3Pos?.toFixed(1) || "-"}`}
              </span>
            ),
            className: "text-center",
          },
        ]}
      />
    </div>
  );
}