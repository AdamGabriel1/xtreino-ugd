// src/app/scrims/hooks/useScrimData.ts
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import type { ScrimMode } from "@/types/scrims";

export function useScrimData(selectedDate: string, selectedMode: ScrimMode | "all" = "all") {
  const isAllTime = selectedDate === "all";

  // 1. Busca a lista principal de scrims e os detalhes do backend unificado
  const { data: scrimsList, isLoading: loadingScrims } = trpc.unified.listScrims.useQuery();
  const { data: scrimDetails, isLoading: loadingDetails } = trpc.scrims.list.useQuery();

  // 2. Extrai as datas disponíveis dinamicamente da lista de scrims
  const availableDates = useMemo(() => {
    if (!scrimsList) return [];
    const dates = new Set(scrimsList.map((s) => s.date).filter(Boolean) as string[]);
    return Array.from(dates).sort().reverse();
  }, [scrimsList]);

  // 3. Filtra os detalhes baseado na data e modo selecionados
  const filteredDetails = useMemo(() => {
    if (!scrimDetails) return [];
    let data = scrimDetails;
    
    if (!isAllTime && selectedDate) {
      data = data.filter((s) => s.date === selectedDate);
    }
    
    // O modo "br" ou "mme" pode vir da propriedade `modality` ou ser inferido. 
    // Ajuste isso se o seu banco usar outra lógica. Por enquanto assumimos que a lista principal já separou.
    return data;
  }, [scrimDetails, isAllTime, selectedDate]);

  // 4. Formata os dados para o tipo "ScrimItem" que a página espera
  const normalizedScrimsList = useMemo(() => {
    if (!scrimsList) return [];
    return scrimsList.map((s) => ({
      id: s.id,
      name: s.name || `Scrim #${s.id}`,
      team1Id: s.team1Id,
      team2Id: s.team2Id,
      team1Name: s.team1Name,
      team2Name: s.team2Name,
      team1Tag: s.team1Tag,
      team2Tag: s.team2Tag,
      date: s.date,
      time: null, // Adicione se existir no seu schema
      modality: "4v4", // Ajuste baseado no seu schema real
      mode: "mme" as ScrimMode, // Ajuste baseado no seu schema real
      status: "concluido",
      result: null, // Preencha dinamicamente se tiver no schema
      createdAt: new Date(),
    }));
  }, [scrimsList]);

  return {
    scrimsList: normalizedScrimsList,
    availableDates,
    scrimDetails: filteredDetails,
    isLoading: loadingScrims || loadingDetails,
  };
}