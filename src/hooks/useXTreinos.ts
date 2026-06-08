// ============================================================
// CUSTOM HOOK - Todas as queries e mutations do Admin XTreinos
// ============================================================

import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { useCallback } from "react";

export function useXTreinos() {
  const utils = trpc.useUtils();

  // Queries
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: scheduleList } = trpc.xtreinos.schedule.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: allTeams } = trpc.teams.list.useQuery();

  // XTreino mutations
  const create = trpc.xtreinos.create.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      toast.success("XTreino criado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.xtreinos.update.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      toast.success("XTreino atualizado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.xtreinos.delete.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      toast.success("XTreino removido!");
    },
    onError: (err) => toast.error(err.message),
  });

  // Result mutations
  const addResult = trpc.xtreinos.addResult.useMutation({
    onSuccess: () => {
      utils.xtreinos.listResults.invalidate();
      utils.xtreinos.getById.invalidate();
      toast.success("Resultado adicionado!");
    },
    onError: (err) => toast.error(err.message),
  });

  // Player mutations
  const addPlayerStats = trpc.xtreinos.addPlayerStats.useMutation({
    onSuccess: () => {
      utils.xtreinos.listPlayerStats.invalidate();
      utils.xtreinos.getById.invalidate();
      toast.success("Stats de jogador adicionadas!");
    },
    onError: (err) => toast.error(err.message),
  });

  // Schedule mutations
  const createSchedule = trpc.xtreinos.schedule.create.useMutation({
    onSuccess: () => {
      utils.xtreinos.schedule.list.invalidate();
      toast.success("Agendamento criado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const generateMonthSchedule = trpc.xtreinos.schedule.generateMonth.useMutation({
    onSuccess: (data) => {
      utils.xtreinos.schedule.list.invalidate();
      toast.success(`${data.generated} xtreinos agendados!`);
    },
    onError: (err) => toast.error(err.message),
  });

  // Registration mutations
  const registerTeam = trpc.xtreinos.addTeam.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      utils.xtreinos.getById.invalidate();
      toast.success("Time inscrito!");
    },
    onError: (err) => toast.error(err.message),
  });

  const unregisterTeam = trpc.xtreinos.removeTeam.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      utils.xtreinos.getById.invalidate();
      toast.success("Time removido da lista!");
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleFixedTeam = trpc.xtreinos.updateTeamSlot.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      utils.xtreinos.getById.invalidate();
      utils.settings.get.invalidate();
      toast.success("Status de time fixo atualizado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateFixedTeamsList = trpc.settings.updateFixedTeams.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Lista de times fixos atualizada!");
    },
    onError: (err) => toast.error(err.message),
  });

  // Helpers
  const invalidateAll = useCallback(() => {
    utils.xtreinos.list.invalidate();
    utils.xtreinos.listResults.invalidate();
    utils.xtreinos.listPlayerStats.invalidate();
    utils.xtreinos.schedule.list.invalidate();
    utils.settings.get.invalidate();
  }, [utils]);

  return {
    // Data
    xtreinosList,
    allResults,
    allPlayerStats,
    scheduleList,
    settings,
    allTeams,

    // Mutations
    create,
    update,
    remove,
    addResult,
    addPlayerStats,
    createSchedule,
    generateMonthSchedule,
    registerTeam,
    unregisterTeam,
    toggleFixedTeam,
    updateFixedTeamsList,

    // Helpers
    invalidateAll,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
}