import { useState } from "react";

export function useClanNavigation() {
  const [selectedClan, setSelectedClan] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const navigateToClan = (clanId: number) => {
    setSelectedClan(clanId);
    setSelectedTeam(null);
    setSelectedPlayer(null);
  };

  const navigateToTeam = (teamId: number) => {
    setSelectedTeam(teamId);
    setSelectedPlayer(null);
  };

  const navigateToPlayer = (playerNickname: string) => {
    setSelectedPlayer(playerNickname);
  };

  const goBack = () => {
    if (selectedPlayer) {
      setSelectedPlayer(null);
    } else if (selectedTeam) {
      setSelectedTeam(null);
    } else if (selectedClan) {
      setSelectedClan(null);
    }
  };

  const reset = () => {
    setSelectedClan(null);
    setSelectedTeam(null);
    setSelectedPlayer(null);
  };

  return {
    selectedClan,
    selectedTeam,
    selectedPlayer,
    navigateToClan,
    navigateToTeam,
    navigateToPlayer,
    goBack,
    reset,
  };
}