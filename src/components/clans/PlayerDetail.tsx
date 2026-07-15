import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PlayerDetail() {
  const { clanId, teamId, playerId } = useParams();
  const navigate = useNavigate();
  const pid = Number(playerId);

  // REDIRECIONAMENTO INTELIGENTE:
  // Como a página de detalhes do jogador (/jogador/:id) já existe e é completa,
  // simplesmente redirecionamos o usuário para ela. Isso evita duplicação de código.
  useEffect(() => {
    if (!isNaN(pid)) {
      // O estado 'from' ajuda o botão "Voltar" do JogadorDetalhe a saber 
      // que ele deve voltar para o Clã em vez da lista de jogadores global
      navigate(`/jogador/${pid}?from=clans/${clanId}/line/${teamId}`, { replace: true });
    }
  }, [pid, clanId, teamId, navigate]);

  return null; // Retornará nulo pois o redirecionamento é imediato
}