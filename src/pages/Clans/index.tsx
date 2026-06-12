import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import { useXtreinoCalculations, calcKillPoints } from "@/hooks/useXtreinoCalculations";
import { useClanNavigation } from "@/pages/Clans/hooks/useClanNavigation";
import type { ClanItem, PlayerItem, EnrichedPlayerItem } from "./types/clans";

import ClanList from "./components/ClanList";
import ClanDetail from "./components/ClanDetail";
import TeamDetail from "./components/TeamDetail";
import PlayerDetail from "./components/PlayerDetail";

export default function Clans() {
  const {
    selectedClan,
    selectedTeam,
    selectedPlayer,
    navigateToClan,
    navigateToTeam,
    navigateToPlayer,
    goBack,
  } = useClanNavigation();

  // Filtros de mês e dia do xtreino
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Queries
  const { data: clansList, isLoading: clansLoading } = trpc.clans.list.useQuery();
  const { data: clanDetail } = trpc.clans.getById.useQuery(
    { id: selectedClan! },
    { enabled: !!selectedClan }
  );
  const { data: teamDetail } = trpc.teams.getById.useQuery(
    { id: selectedTeam! },
    { enabled: !!selectedTeam }
  );
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playerDetail } = trpc.players.getById.useQuery(
    { id: selectedPlayer ? parseInt(selectedPlayer) : 0 },
    { enabled: !!selectedPlayer && !isNaN(parseInt(selectedPlayer)) }
  );

  // Hook de cálculos do xtreino
  const { playerAccumulated, playerXtreinoStats, availableMonths, availableDates } =
    useXtreinoCalculations({
      results: allResults ?? [],
      playerStats: allPlayerStats ?? [],
      selectedMonth,
      selectedDate,
    });

  const isSingleXtreino = !!selectedDate;

  // Helper: enriquecer jogador com stats de xtreino
  const enrichPlayer = (player: PlayerItem): EnrichedPlayerItem => {
    const nameKey = player.nickname.trim().toLowerCase();

    if (isSingleXtreino) {
      const dayStats = playerXtreinoStats.find(
        (s) => s.playerName.trim().toLowerCase() === nameKey && s.date === selectedDate
      );

      if (dayStats) {
        return {
          ...player,
          totalXtreinoKills: dayStats.totalKills,
          q1Kills: dayStats.q1Kills,
          q2Kills: dayStats.q2Kills,
          q3Kills: dayStats.q3Kills,
          participations: 1,
          avgKills: dayStats.totalKills,
          killPoints: dayStats.killPoints,
          xtreinoDates: [selectedDate],
        };
      }
      return {
        ...player,
        totalXtreinoKills: 0,
        q1Kills: 0,
        q2Kills: 0,
        q3Kills: 0,
        participations: 0,
        avgKills: 0,
        killPoints: 0,
        xtreinoDates: [],
      };
    }

    const stats = playerAccumulated.find(
      (s) => s.playerName.trim().toLowerCase() === nameKey
    );

    return {
      ...player,
      totalXtreinoKills: stats?.totalKills ?? 0,
      q1Kills: stats?.totalQ1Kills ?? 0,
      q2Kills: stats?.totalQ2Kills ?? 0,
      q3Kills: stats?.totalQ3Kills ?? 0,
      participations: stats?.participations ?? 0,
      avgKills: stats?.avgKills ?? 0,
      killPoints: calcKillPoints(stats?.totalKills ?? 0),
      xtreinoDates: stats?.xtreinoDates ?? [],
    };
  };

  // Stats do jogador selecionado
  const selectedPlayerStats = useMemo(() => {
    if (!selectedPlayer) return [];
    const nameKey = selectedPlayer.toLowerCase();
    return playerXtreinoStats.filter((s) => s.playerName.toLowerCase() === nameKey);
  }, [selectedPlayer, playerXtreinoStats]);

  // ===== RENDERIZAÇÃO CONDICIONAL =====

  // Player Detail
  if (selectedPlayer && playerDetail) {
    return (
      <MainLayout>
        <PlayerDetail
          nickname={selectedPlayer}
          player={playerDetail}
          clanName={clanDetail?.name ?? "—"}
          teamName={teamDetail?.name ?? "—"}
          xtreinoHistory={selectedPlayerStats}
          selectedMonth={selectedMonth}
          onBack={goBack}
        />
      </MainLayout>
    );
  }

  // Team Detail
  if (selectedTeam && teamDetail) {
    return (
      <MainLayout>
        <TeamDetail
          team={teamDetail}
          clanName={clanDetail?.name ?? "Clã"}
          onBack={goBack}
          onPlayerClick={navigateToPlayer}
          enrichPlayer={enrichPlayer}
          xtreinoFilters={{
            selectedMonth,
            selectedDate,
            availableMonths,
            availableDates,
            onMonthChange: (m) => { setSelectedMonth(m); setSelectedDate(""); },
            onDateChange: setSelectedDate,
            onClear: () => { setSelectedMonth(""); setSelectedDate(""); },
          }}
        />
      </MainLayout>
    );
  }

  // Clan Detail
  if (selectedClan && clanDetail) {
    return (
      <MainLayout>
        <ClanDetail
          clan={clanDetail}
          onBack={goBack}
          onTeamClick={navigateToTeam}
          enrichPlayer={enrichPlayer}
        />
      </MainLayout>
    );
  }

  // Clan List (default)
  return (
    <MainLayout>
      <ClanList
        clans={clansList ?? []}
        isLoading={clansLoading}
        onClanClick={navigateToClan}
      />
    </MainLayout>
  );
}