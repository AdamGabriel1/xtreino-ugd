import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import type { EnrichedScrimPlayer, EnrichedScrimTeam } from "@/types/scrims";

function sortList<T extends Record<string, unknown>>(list: T[], field: string, dir: "asc" | "desc"): T[] {
  return [...list].sort((a, b) => { const aVal = a[field] ?? 0; const bVal = b[field] ?? 0; const aNum = typeof aVal === 'number' ? aVal : 0; const bNum = typeof bVal === 'number' ? bVal : 0; return dir === "desc" ? bNum - aNum : aNum - bNum; });
}

export interface ScrimSummaryCard { iconId: string; label: string; value: number; valueColor?: string; }

export function useScrimPlayersRankingTab() {
  const [search, setSearch] = useState(""); const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"scrimKills" | "scrimMvps" | "scrimKdRatio" | "totalMatches">("scrimKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { data: playersList, isLoading } = trpc.unified.listPlayers.useQuery();

  const handleSort = (field: typeof sortField) => { if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc")); else { setSortField(field); setSortDir("desc"); } };
  const clearFilters = () => { setSearch(""); setSelectedTeam(null); };
  const hasFilters = !!search || !!selectedTeam;

  const filteredPlayers = useMemo(() => {
    if (!playersList) return [];
    let list = playersList as unknown as EnrichedScrimPlayer[];
    if (selectedTeam) list = list.filter((p) => p.teamName === selectedTeam);
    if (search) { const q = search.toLowerCase(); list = list.filter((p) => p.nickname.toLowerCase().includes(q) || (p.teamName?.toLowerCase() ?? "").includes(q)); }
    return list;
  }, [playersList, selectedTeam, search]);

  const sortedPlayers = useMemo(() => sortList(filteredPlayers as unknown as Record<string, unknown>[], sortField, sortDir) as unknown as EnrichedScrimPlayer[], [filteredPlayers, sortField, sortDir]);
  const allTeams = useMemo(() => { if (!playersList) return []; return [...new Set(playersList.map((p) => p.teamName).filter(Boolean))].sort(); }, [playersList]);

  const summaryCards: ScrimSummaryCard[] = [
    { iconId: "users", label: "Jogadores", value: sortedPlayers.length },
    { iconId: "target", label: "Total Kills", value: sortedPlayers.reduce((s, p) => s + (p.scrimKills || 0), 0), valueColor: "text-red-400" },
    { iconId: "crosshair", label: "Total Assists", value: sortedPlayers.reduce((s, p) => s + (p.scrimAssists || 0), 0), valueColor: "text-orange-400" },
    { iconId: "award", label: "Total MVPs", value: sortedPlayers.reduce((s, p) => s + (p.scrimMvps || 0), 0), valueColor: "text-yellow-400" },
  ];

  return { isLoading, search, setSearch, selectedTeam, setSelectedTeam, sortField, sortDir, handleSort, clearFilters, hasFilters, sortedPlayers, allTeams, summaryCards };
}

export function useScrimTeamsRankingTab() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"scrimKills" | "scrimWins" | "scrimMatches">("scrimWins");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { data: teamsList, isLoading } = trpc.unified.listTeams.useQuery();

  const handleSort = (field: typeof sortField) => { if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc")); else { setSortField(field); setSortDir("desc"); } };
  const clearFilters = () => { setSearch(""); };
  const hasFilters = !!search;

  const filteredTeams = useMemo(() => {
    if (!teamsList) return [];
    return (teamsList as unknown as Array<Record<string, any>>).filter(t => (t.scrimMatches ?? 0) > 0).map(t => ({ name: t.name, tag: t.tag, scrimKills: t.scrimKills ?? 0, scrimWins: t.scrimWins ?? 0, scrimLosses: t.scrimLosses ?? 0, scrimMatches: t.scrimMatches ?? 0, winRate: (t.scrimMatches ?? 0) > 0 ? Math.round(((t.scrimWins ?? 0) / (t.scrimMatches ?? 0)) * 1000) / 10 : 0 })) as EnrichedScrimTeam[];
  }, [teamsList]);

  const sortedTeams = useMemo(() => sortList(filteredTeams as unknown as Record<string, unknown>[], sortField, sortDir) as unknown as EnrichedScrimTeam[], [filteredTeams, sortField, sortDir]);

  const summaryCards: ScrimSummaryCard[] = [
    { iconId: "shield", label: "Times", value: sortedTeams.length },
    { iconId: "target", label: "Total Kills", value: sortedTeams.reduce((s, t) => s + (t.scrimKills || 0), 0), valueColor: "text-red-400" },
    { iconId: "trophy", label: "Vitórias", value: sortedTeams.reduce((s, t) => s + (t.scrimWins || 0), 0), valueColor: "text-yellow-400" },
    { iconId: "barChart3", label: "Partidas", value: sortedTeams.reduce((s, t) => s + (t.scrimMatches || 0), 0) },
  ];

  return { isLoading, search, setSearch, sortField, sortDir, handleSort, clearFilters, hasFilters, sortedTeams, summaryCards };
}