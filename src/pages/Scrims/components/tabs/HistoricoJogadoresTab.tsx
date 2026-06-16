"use client";

import { useMemo } from "react";
import { BarChart3, Target } from "lucide-react";
import { ScrimTable } from "../tables/ScrimTable";
import { DateFilter } from "../DateFilter";
import { EmptyState } from "../EmptyState";
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
}

export function HistoricoJogadoresTab({
  selectedDate,
  availableDates,
  onDateChange,
  scrimPlayerStats,
  scrimPlayerAllTime,
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
        wins: 0,
        participations: p.matches || 0,
        q1Kills: p.totalQ1 || 0,
        q2Kills: p.totalQ2 || 0,
        q3Kills: p.totalQ3 || 0,
        teamName: p.teamName,
      }))
      .sort((a, b) => b.points - a.points);
  }, [isAllTime, scrimPlayerStats, scrimPlayerAllTime]);

  return (
    <div className="space-y-6">
      <DateFilter
        selectedDate={selectedDate}
        availableDates={availableDates}
        onChange={onDateChange}
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
              <span className="text-sm font-bold text-[#f0f0f5]">
                {row.entityName}
              </span>
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
