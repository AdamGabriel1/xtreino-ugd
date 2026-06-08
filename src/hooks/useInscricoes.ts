import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

export interface InscricaoEquipe {
  id: number;
  xtreinoId: number;
  teamName: string;
  status: "confirmada" | "reserva" | "pendente" | "cancelada";
  registeredBy: string | null;
  registeredAt: string | null;
  players: string[];
  position: number;
}

export interface XtreinoEvento {
  id: number;
  name: string;
  date: string;
  status: string;
  maxTeams: number;
  timeBr?: string | null;
  timeMx?: string | null;
  modality?: string | null;
  whatsappLink?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function useInscricoes() {
  const utils = trpc.useUtils();

  // Queries - usando o router "registrations" que já existe no backend
  const { data: registrationsList, isLoading: isLoadingRegistrations } = trpc.registrations.list.useQuery();

  // Query de xtreinos para listar os eventos disponíveis
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();

  // Resumo de inscrições por xtreino
  const resumo = xtreinosList?.map(x => {
    const regs = registrationsList?.filter(r => r.xtreinoId === x.id) || [];
    const confirmed = regs.filter(r => r.status === "confirmada").length;
    return {
      id: x.id,
      date: x.date,
      status: x.status,
      maxTeams: x.maxTeams,
      equipesInscritas: confirmed,
      vagasRestantes: x.maxTeams - confirmed,
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
    };
  });

  // Mutations do router registrations
  const registerTeam = trpc.registrations.register.useMutation({
    onSuccess: () => {
      toast.success("Equipe inscrita com sucesso!");
      utils.registrations.list.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const unregisterTeam = trpc.registrations.unregister.useMutation({
    onSuccess: () => {
      toast.success("Equipe removida!");
      utils.registrations.list.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const toggleFixed = trpc.registrations.toggleFixed.useMutation({
    onSuccess: () => {
      toast.success("Time fixo atualizado!");
      utils.registrations.list.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  // Mock mutations para funcionalidades que podem não existir no registrations router
  const inscrever = {
    mutate: (data: { xtreinoId: number; teamName: string; players: string[]; registeredBy?: string }) => {
      toast.success(`Equipe ${data.teamName} inscrita!`);
      console.log("Inscrever:", data);
    },
    isPending: registerTeam.isPending,
  };

  const cancelarInscricao = {
    mutate: (data: { xtreinoId: number; teamName: string }) => {
      toast.success(`Inscrição de ${data.teamName} cancelada!`);
      console.log("Cancelar:", data);
    },
    isPending: unregisterTeam.isPending,
  };

  const removerInscricao = {
    mutate: (data: { xtreinoId: number; teamName: string }) => {
      toast.success(`Equipe ${data.teamName} removida!`);
      console.log("Remover:", data);
    },
    isPending: unregisterTeam.isPending,
  };

  const createEvent = {
    mutate: (data: { date: string; maxTeams: number; status?: string }) => {
      toast.success("Xtreino criado! (use xtreinos.create)");
      console.log("Criar evento:", data);
    },
    isPending: false,
  };

  const updateEventStatus = {
    mutate: (data: { id: number; status: string }) => {
      toast.success("Status atualizado! (use xtreinos.update)");
      console.log("Update status:", data);
    },
    isPending: false,
  };

  const migrarHistoricos = {
    mutate: () => {
      toast.success("Migrado! (implemente no backend)");
    },
    isPending: false,
  };

  // Hook para buscar inscrições de um xtreino específico
  const useInscricoesPorXtreino = (xtreinoId: number | null) => {
    const regs = registrationsList?.filter(r => r.xtreinoId === xtreinoId) || [];
    return { 
      data: regs.map((r, index) => ({
            ...r,
            players: (r as any).players || [],
            position: (r as any).position || index + 1,
        })) as unknown as InscricaoEquipe[], 
      isLoading: isLoadingRegistrations 
    };
  };

  // Hook para buscar detalhes de um evento
  const useEventoById = (id: number | null) => {
    const evento = xtreinosList?.find(e => e.id === id);
    return { 
      data: evento as XtreinoEvento | undefined, 
      isLoading: false 
    };
  };

  return {
    // Data
    eventos: xtreinosList as XtreinoEvento[] | undefined,
    registrations: registrationsList as InscricaoEquipe[] | undefined,
    resumo,
    isLoadingEventos: isLoadingRegistrations,

    // Mutations existentes do registrations router
    registerTeam,
    unregisterTeam,
    toggleFixed,

    // Mock mutations (substitua pelas reais)
    inscrever,
    cancelarInscricao,
    removerInscricao,
    createEvent,
    updateEventStatus,
    migrarHistoricos,

    // Hooks
    useInscricoesPorXtreino,
    useEventoById,
  };
}