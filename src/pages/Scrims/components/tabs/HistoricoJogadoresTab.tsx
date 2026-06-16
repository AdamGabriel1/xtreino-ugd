"use client";

import { useMemo } from "react";
import { BarChart3, Target, ChevronRight, Users, Zap, Crosshair, Shield, Award } from "lucide-react";
import { ScrimTable } from "../tables/ScrimTable";
import { DateFilter } from "../DateFilter";
import { EmptyState } from "../EmptyState";
import { HistorySummary } from "../HistorySummary";
import type {
  PlayerStat,
  PlayerAllTime,
  EnrichedPlayerRow,
} from "../../types";

interface HistoricoJogadoresTabProps {
  selectedDate: string;
  availableDates?: string[];
  onDateChange: (date: string) => void;
  scrimPlayerStats?: PlayerStat[];
  scrimPlayerAllTime?: PlayerAllTime[];
  onPlayerClick?: (playerName: string, teamName: string) => void;
}

export function HistoricoJogadoresTab({
  selectedDate,
  availableDates,
  onDateChange,
  scrimPlayerStats,
  scrimPlayerAllTime,
  onPlayerClick,
}: HistoricoJogadoresTabProps) {
  const isAllTime = selectedDate === "all";

  const data = useMemo<EnrichedPlayerRow[]>(() => {
    if (!isAllTime) {
      return (scrimPlayerStats || [])
        .map((p) => ({
          id: p.id,
          entityName: p.playerName,
          points: p.totalKills || 0,
          kills: p.totalKills || 0,
          assists: p.totalAssists || 0,
          deaths: p.totalDeaths || 0,
          damage: p.totalDamage || 0,
          mvps: p.totalMvp || 0,
          wins: 0,
          participations: 1,
          q1Kills: p.q1Kills || 0,
          q2Kills: p.q2Kills || 0,
          q3Kills: p.q3Kills || 0,
          teamName: p.teamName,
        }))
        .sort((a, b) => b.points - a.points);
    }

    return (scrimPlayerAllTime || [])
      .map((p, i) => ({
        id: i,
        entityName: p.playerName,
        points: p.totalKills || 0,
        kills: p.totalKills || 0,
        assists: p.totalAssists || 0,
        deaths: p.totalDeaths || 0,
        damage: p.totalDamage || 0,
        mvps: p.totalMvp || 0,
        wins: 0,
        participations: p.matches || 0,
        q1Kills: p.totalQ1 || 0,
        q2Kills: p.totalQ2 || 0,
        q3Kills: p.totalQ3 || 0,
        teamName: p.teamName,
      }))
      .sort((a, b) => b.points - a.points);
  }, [isAllTime, scrimPlayerStats, scrimPlayerAllTime]);

  const summary = useMemo(() => {
    return {
      totalTeams: new Set(data.map((d) => d.teamName)).size,
      totalKills: data.reduce((sum, p) => sum + (p.kills || 0), 0),
      totalAssists: data.reduce((sum, p) => sum + (p.assists || 0), 0),
      totalDeaths: data.reduce((sum, p) => sum + (p.deaths || 0), 0),
      totalDamage: data.reduce((sum, p) => sum + (p.damage || 0), 0),
      totalPoints: data.reduce((sum, p) => sum + (p.points || 0), 0),
      totalScrims: data.reduce((sum, p) => sum + (p.participations || 0), 0),
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
            key: "player",
            header: "Jogador",
            cell: (row) => (
              <button
                onClick={() => onPlayerClick?.(row.entityName, row.teamName)}
                className="text-sm font-bold text-[#f0f0f5] hover:text-emerald-400 transition-colors flex items-center gap-1 group"
              >
                {row.entityName}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ),
          },
          {
            key: "team",
            header: "Time",
            cell: (row) => (
              <span className="text-xs text-[#5a5a6e]">{row.teamName || "—"}</span>
            ),
          },
          {
            key: "points",
            header: (
              <span className="flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> Pontos
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
            key: "assists",
            header: (
              <span className="flex items-center justify-center gap-1">
                <Crosshair className="w-3 h-3" /> Assists
              </span>
            ),
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] text-center block">
                {row.assists ?? 0}
              </span>
            ),
            className: "text-center",
          },
          {
            key: "deaths",
            header: (
              <span className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Deaths
              </span>
            ),
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] text-center block">
                {row.deaths ?? 0}
              </span>
            ),
            className: "text-center",
          },
          {
            key: "damage",
            header: (
              <span className="flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> Dano
              </span>
            ),
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] text-center block">
                {(row.damage ?? 0).toLocaleString()}
              </span>
            ),
            className: "text-center",
          },
          {
            key: "mvps",
            header: (
              <span className="flex items-center justify-center gap-1">
                <Award className="w-3 h-3" /> MVPs
              </span>
            ),
            cell: (row) => (
              <span className="text-sm text-yellow-400 text-center block font-medium">
                {row.mvps ?? 0}
              </span>
            ),
            className: "text-center",
          },
          {
            key: "participations",
            header: (
              <span className="flex items-center justify-center gap-1">
                <Users className="w-3 h-3" /> Scrims
              </span>
            ),
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] text-center block">
                {row.participations ?? 0}
              </span>
            ),
            className: "text-center",
          },
          {
            key: "q",
            header: "Q1 / Q2 / Q3 (kills)",
            cell: (row) => (
              <span className="text-sm text-[#8a8a9e] font-mono text-center block">
                {row.q1Kills ?? 0} / {row.q2Kills ?? 0} / {row.q3Kills ?? 0}
              </span>
            ),
            className: "text-center",
          },
        ]}
      />
    </div>
  );
}