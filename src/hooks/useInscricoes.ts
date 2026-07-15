import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
// Ajuste este import para o caminho real onde estão os types InscricaoEquipe, etc. 
// Ex: import type { InscricaoEquipe, XtreinoEvento, SeedXtreinoData } from "@/types/inscricoes";
import type { InscricaoEquipe, XtreinoEvento, SeedXtreinoData } from "@/types/inscricoes"; 

export function useInscricoes(xtreinoId: number) {
  const [xtreino, setXtreino] = useState<XtreinoEvento | null>(null);
  const [inscricoes, setInscricoes] = useState<InscricaoEquipe[]>([]);
  const [fixedTeams, setFixedTeams] = useState<string[]>([]);
  const [allTeams, setAllTeams] = useState<Array<{ id: number; name: string; tag: string }>>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const utils = trpc.useUtils();

  useEffect(() => {
    if (!xtreinoId) return;
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [xt, ins, ft, at] = await Promise.all([
          utils.xtreinoInscricoes.getXtreino.fetch({ id: xtreinoId }),
          utils.xtreinoInscricoes.listByXtreino.fetch({ xtreinoId }),
          utils.xtreinoInscricoes.getFixedTeams.fetch(),
          utils.xtreinoInscricoes.getAllTeams.fetch(),
        ]);

        if (isMounted) {
          setXtreino(xt);
          setInscricoes(ins ?? []);
          setFixedTeams(ft ?? []);
          setAllTeams(at ?? []);
        }
      } catch (err: any) {
        if (isMounted) toast.error(err.message || "Erro ao carregar dados");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [xtreinoId, utils]);

  const handleInvalidate = useCallback(async () => {
    await Promise.all([
      utils.xtreinoInscricoes.getXtreino.invalidate({ id: xtreinoId }),
      utils.xtreinoInscricoes.listByXtreino.invalidate({ xtreinoId }),
      utils.xtreinoInscricoes.getFixedTeams.invalidate(),
    ]);
  }, [xtreinoId, utils]);

  const register = useCallback(async (data: { teamName: string; players: string[]; isReserve: boolean }) => {
    setIsPending(true);
    try {
      // CORREÇÃO: Usar mutateAsync no tRPC v11+
      await utils.xtreinoInscricoes.register.mutateAsync({ ...data, xtreinoId });
      toast.success("Time inscrito com sucesso!");
      await handleInvalidate();
    } catch (err: any) {
      toast.error(err.message || "Erro ao inscrever time");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, utils, handleInvalidate]);

  const cancel = useCallback(async (teamName: string) => {
    setIsPending(true);
    try {
      await utils.xtreinoInscricoes.cancel.mutateAsync({ xtreinoId, teamName });
      toast.success("Inscrição cancelada!");
      await handleInvalidate();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, utils, handleInvalidate]);

  const reactivate = useCallback(async (teamName: string) => {
    setIsPending(true);
    try {
      await utils.xtreinoInscricoes.reactivate.mutateAsync({ xtreinoId, teamName });
      toast.success("Inscrição reativada!");
      await handleInvalidate();
    } catch (err: any) {
      toast.error(err.message || "Erro ao reativar");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, utils, handleInvalidate]);

  const remove = useCallback(async (teamName: string) => {
    setIsPending(true);
    try {
      await utils.xtreinoInscricoes.unregister.mutateAsync({ xtreinoId, teamName });
      toast.success("Time removido!");
      await handleInvalidate();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, utils, handleInvalidate]);

  const fixedSet = useMemo(() => new Set(fixedTeams.map(t => t.toLowerCase())), [fixedTeams]);

  const confirmedTeams = useMemo(() =>
    inscricoes.filter(r => r.status === "confirmada").sort((a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0)),
    [inscricoes]
  );

  const cancelledTeams = useMemo(() =>
    inscricoes.filter(r => r.status === "cancelada"),
    [inscricoes]
  );

  const generateWhatsAppMessage = useCallback(() => {
    if (!xtreino) return "";
    const dateParts = xtreino.date.split("-");
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : xtreino.date;

    const [h, m] = (xtreino.timeBr || "21:00").split(":").map(Number);
    const times = {
      brAr: `${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      boCl: `${String(h - 1).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      coPe: `${String(h - 2).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      mxNi: `${String(h - 3).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      us: `${String(h - 4).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
    };

    let teamsList = "";
    for (let i = 1; i <= xtreino.maxTeams; i++) {
      const team = confirmedTeams.find(t => t.slotNumber === i);
      const isFixed = team ? fixedSet.has(team.teamName.toLowerCase()) : false;
      const isCancelled = cancelledTeams.find(t => t.slotNumber === i);
      const emoji = isFixed ? "📌" : "🎫";
      const pos = String(i).padStart(2, "0");

      if (isCancelled) {
        teamsList += `❌ ${pos} - ~${isCancelled.teamName}~\n`;
      } else if (team) {
        teamsList += `${emoji} ${pos} - ${team.teamName}\n`;
      } else {
        teamsList += `${emoji} ${pos} -\n`;
      }
    }

    return `𝙐𝙉𝘿𝙀𝙍𝙂𝙍𝙊𝙐𝙉𝘿 - 𝙓𝙏𝙍𝙀𝙄𝙉𝙊𝙎 𝙈𝙊𝘽𝙄𝙇𝙀 (${formattedDate})


⚔️ 𝙈𝙊𝘿𝙊 ${(xtreino.modality || "squad").toUpperCase()} 
⛳ 3 𝙌𝙐𝙀𝘿𝘼𝙎 
🌴 𝙄𝙇𝙃𝘼 𝘿𝙊 𝙈𝙀𝘿𝙊


🇧🇷🇦🇷 ${times.brAr}
🇧🇴🇨🇱 ${times.boCl}
🇨🇴🇵🇪 ${times.coPe}
🇲🇽🇳🇮 ${times.mxNi}
🇺🇸 ${times.us} (GMT-7)

FIXO 📌
TEMPORÁRIO 🎫

 ${teamsList}
\`Regras:\`

🚨 SEM AUXÍLIO DE MIRA
🚫 LANÇA GRANADA E LANÇA CHAMAS
🚫 LANÇA GRANADAS
🚫 LANÇA CHAMAS
🚫 MUNIÇÃO INCENDIÁRIA
🚫 M1887 LOADOUT
🚫 ORIGIN - 12 LOADOUT
🚫 M82 INCENDIÁRIA

_em caso de uso dessas armas será penalizado em -40 pontos_


Grupo do Whatsapp: ${xtreino.whatsappLink || "https://chat.whatsapp.com/Ks4fDFnA7eBHk9ULHuHyzm"}`;
  }, [xtreino, confirmedTeams, cancelledTeams, fixedSet]);

  const generateInscricoesMessage = useCallback(() => {
    return `📝INSCRIÇÕES:

🛡️ NOME DA EQUIPE:

PLAYER 1:
PLAYER 2:
PLAYER 3:
PLAYER 4:
RESERVAS:

@todos`;
  }, []);

  const generateSeed = useCallback((): SeedXtreinoData | null => {
    if (!xtreino) return null;
    const colocacoes: Array<[string, number, number, number]> = confirmedTeams.map(team => [team.teamName, 0, 0, 0]);
    const jogadores: Array<[string, string, number, number, number]> = [];
    for (const team of confirmedTeams) {
      for (const player of team.players) {
        jogadores.push([team.teamName, player, 0, 0, 0]);
      }
    }
    return { id: xtreino.id, date: xtreino.date, colocacoes, jogadores };
  }, [xtreino, confirmedTeams]);

  return {
    xtreino, inscricoes, fixedTeams, allTeams,
    confirmedTeams, cancelledTeams,
    isLoading, isPending,
    register, cancel, reactivate, remove,
    generateWhatsAppMessage, generateInscricoesMessage, generateSeed,
  };
}