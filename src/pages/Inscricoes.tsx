import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { InscricoesManager } from "./InscricoesManager"; // ajuste o path
import type { InscricaoEquipe, XtreinoEvento } from "@/types/inscricoes";

export default function Inscricoes() {
  const [searchParams] = useSearchParams();
  const xtreinoId = searchParams.get("xtreinoId");

  const [xtreino, setXtreino] = useState<XtreinoEvento | null>(null);
  const [inscricoes, setInscricoes] = useState<InscricaoEquipe[]>([]);
  const [fixedTeams, setFixedTeams] = useState<string[]>([]);
  const [allTeams, setAllTeams] = useState<Array<{ id: number; name: string; tag: string }>>([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Buscar dados do xtreino
    if (xtreinoId) {
      fetch(`/api/xtreinos/${xtreinoId}`)
        .then((r) => r.json())
        .then((data) => setXtreino(data));
    }

    // Buscar inscrições
    fetch(`/api/inscricoes${xtreinoId ? `?xtreinoId=${xtreinoId}` : ""}`)
      .then((r) => r.json())
      .then((data) => setInscricoes(data));

    // Buscar times fixos
    fetch("/api/fixed-teams")
      .then((r) => r.json())
      .then((data) => setFixedTeams(data));

    // Buscar todos os times
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => setAllTeams(data));
  }, [xtreinoId]);

  const handleRegister = async (data: { teamName: string; players: string[]; isReserve: boolean }) => {
    setIsPending(true);
    try {
      await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, xtreinoId }),
      });
      toast.success("Time inscrito!");
      // recarregar inscrições
      const res = await fetch(`/api/inscricoes${xtreinoId ? `?xtreinoId=${xtreinoId}` : ""}`);
      setInscricoes(await res.json());
    } catch {
      toast.error("Erro ao inscrever time");
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = async ({ teamName }: { teamName: string }) => {
    setIsPending(true);
    try {
      await fetch(`/api/inscricoes/${teamName}/cancel`, { method: "POST" });
      const res = await fetch(`/api/inscricoes${xtreinoId ? `?xtreinoId=${xtreinoId}` : ""}`);
      setInscricoes(await res.json());
    } finally {
      setIsPending(false);
    }
  };

  const handleReactivate = async (data: { teamName: string; players: string[]; isReserve: boolean }) => {
    setIsPending(true);
    try {
      await fetch(`/api/inscricoes/${data.teamName}/reactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const res = await fetch(`/api/inscricoes${xtreinoId ? `?xtreinoId=${xtreinoId}` : ""}`);
      setInscricoes(await res.json());
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async ({ teamName }: { teamName: string }) => {
    setIsPending(true);
    try {
      await fetch(`/api/inscricoes/${teamName}`, { method: "DELETE" });
      const res = await fetch(`/api/inscricoes${xtreinoId ? `?xtreinoId=${xtreinoId}` : ""}`);
      setInscricoes(await res.json());
    } finally {
      setIsPending(false);
    }
  };

  if (!xtreino) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-[#8a8a9e]">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#f0f0f5] mb-6">
          Inscrições — {xtreino.name}
        </h1>
        <InscricoesManager
          xtreino={xtreino}
          inscricoes={inscricoes}
          fixedTeams={fixedTeams}
          allTeams={allTeams}
          onRegister={handleRegister}
          onCancel={handleCancel}
          onReactivate={handleReactivate}
          onRemove={handleRemove}
          isPending={isPending}
        />
      </div>
    </div>
  );
}