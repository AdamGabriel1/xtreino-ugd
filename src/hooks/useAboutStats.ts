import { trpc } from "@/providers/trpc";

export function useAboutStats() {
  // Busca dados reais do banco via TRPC
  const { data: playersData } = trpc.players.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: teamsData } = trpc.teams.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: championshipsData } = trpc.championships.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Calcula os totais com fallback para 0 (enquanto carrega)
  const xtreinosRealizados = playersData?.reduce((sum: any, p: any) => sum + (p.xtreinoParticipations ?? 0), 0) ?? 0;
  const equipesAtivas = teamsData?.length ?? 0;
  const jogadoresRegistrados = playersData?.length ?? 0;
  const campeonatosRealizados = championshipsData?.length ?? 0;

  return {
    xtreinosRealizados,
    equipesAtivas,
    jogadoresRegistrados,
    campeonatosRealizados,
    isLoading: !playersData || !teamsData || !championshipsData,
  };
}