import { useNavigate, useParams, useLocation } from "react-router";
import { useCallback } from "react";

export function useClanNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pega os parâmetros da URL (ex: /clans/1/line/2/jogador/5)
  const { clanId, teamId, playerId } = useParams<{
    clanId: string;
    teamId: string;
    playerId: string;
  }>();

  const selectedClan = clanId ? parseInt(clanId) : null;
  const selectedTeam = teamId ? parseInt(teamId) : null;
  const selectedPlayer = playerId ? parseInt(playerId) : null;

  const navigateToClan = useCallback((id: number) => {
    navigate(`/clans/${id}`);
  }, [navigate]);

  const navigateToTeam = useCallback((clanIdNum: number, teamIdNum: number) => {
    navigate(`/clans/${clanIdNum}/line/${teamIdNum}`);
  }, [navigate]);

  const navigateToPlayer = useCallback((clanIdNum: number, teamIdNum: number, playerIdNum: number) => {
    navigate(`/clans/${clanIdNum}/line/${teamIdNum}/jogador/${playerIdNum}`);
  }, [navigate]);

  const goBack = useCallback(() => {
    // Se estou no jogador, volto para a line
    if (selectedPlayer && selectedTeam && selectedClan) {
      navigate(`/clans/${selectedClan}/line/${selectedTeam}`);
    } 
    // Se estou na line, volto para o clã
    else if (selectedTeam && selectedClan) {
      navigate(`/clans/${selectedClan}`);
    } 
    // Se estou no clã, volto para a lista
    else if (selectedClan) {
      navigate("/clans");
    } else {
      navigate(-1); // Fallback para o histórico do navegador
    }
  }, [navigate, selectedClan, selectedTeam, selectedPlayer]);

  const reset = useCallback(() => {
    navigate("/clans");
  }, [navigate]);

  return { 
    selectedClan, 
    selectedTeam, 
    selectedPlayer, 
    navigateToClan, 
    navigateToTeam, 
    navigateToPlayer, 
    goBack, 
    reset 
  };
}