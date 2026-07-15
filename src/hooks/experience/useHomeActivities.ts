// src/hooks/experience/useHomeActivities.ts
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import type { RecentActivity, UpcomingEvent } from "@/types/experience";
import type { TeamRankingStats } from "@/hooks/xtreinos/useXtreinoCalculations";

function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

export function useHomeActivities(teamRanking?: TeamRankingStats[]) {
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined);
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined);
  const { data: salinhasList } = trpc.salinhas.list.useQuery();

  const recentActivities = useMemo<RecentActivity[]>(() => {
    const activities: RecentActivity[] = [];
    let idCounter = 1;

    if (allXtreinos && allXtreinos.length > 0) {
      const recentXtreinos = allXtreinos.filter((x) => x.status === "fechado").sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 3);
      for (const xt of recentXtreinos) {
        const winner = teamRanking?.filter((t) => t.xtreinos.some((x) => x.xtreinoId === xt.id)).sort((a, b) => b.totalPoints - a.totalPoints)[0];
        activities.push({
          id: idCounter++, type: "xtreino", title: `XTreino #${xt.id} — ${xt.name}`,
          description: winner ? `Vitória de "${winner.teamName}" com ${winner.totalPoints} pts` : "Resultado computado",
          date: xt.date || "Data não definida", highlight: winner?.teamName,
        });
      }
    }

    if (allChampionships && allChampionships.length > 0) {
      allChampionships.slice(-2).reverse().forEach((champ) => {
        activities.push({
          id: idCounter++, type: "championship", title: `Campeonato "${champ.name}"`,
          description: champ.status === "ativo" ? "Em andamento" : champ.status === "inscricoes" ? "Inscrições abertas" : "Encerrado",
          date: champ.startDate || "Data não definida",
        });
      });
    }

    if (allScrims && allScrims.length > 0) {
      allScrims.filter((s) => s.status === "finalizado").slice(-2).reverse().forEach((scrim) => {
        activities.push({ id: idCounter++, type: "scrim", title: `Scrim "${scrim.name}"`, description: "Scrim finalizado", date: scrim.date || "Data não definida" });
      });
    }

    if (teamRanking && teamRanking.length > 0) {
      const topTeam = teamRanking[0];
      activities.push({ id: idCounter++, type: "ranking", title: "Ranking Atualizado", description: `"${topTeam.teamName}" lidera com ${topTeam.totalPoints} pts`, date: new Date().toISOString().split("T")[0], highlight: topTeam.teamName });
    }

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [allXtreinos, allChampionships, allScrims, teamRanking]);

  const upcomingEvents = useMemo<UpcomingEvent[]>(() => {
    const events: UpcomingEvent[] = [];

    if (allXtreinos) {
      const filtered = allXtreinos.filter(x => x.status === "aberto");
      for (const xt of filtered) {
        events.push({ id: xt.id, type: 'xtreino', title: xt.name, date: xt.date, timeBr: xt.timeBr, maxTeams: xt.maxTeams, status: xt.status });
      }
    }

    if (allChampionships) {
      const upcomingChamps = allChampionships.filter(c => c.status === "em_breve" || c.status === "inscricoes");
      for (const champ of upcomingChamps) {
        events.push({ id: champ.id, type: 'championship', title: champ.name, date: champ.startDate || '', maxTeams: champ.maxTeams, registeredTeams: champ.registeredTeams, status: champ.status, location: champ.modality });
      }
    }

    if (salinhasList) {
      const openSalinhas = salinhasList.filter(s => s.status === "aberta");
      for (const salinha of openSalinhas) {
        events.push({ id: salinha.id, type: 'salinha', title: salinha.name, date: salinha.date, timeBr: salinha.timeBr, maxParticipants: salinha.maxParticipants, status: salinha.status, location: salinha.modality });
      }
    }

    return events
      .sort((a, b) => {
        const dateA = parseDateString(a.date);
        const dateB = parseDateString(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 4);
  }, [allXtreinos, allChampionships, salinhasList]);

  return { recentActivities, upcomingEvents };
}