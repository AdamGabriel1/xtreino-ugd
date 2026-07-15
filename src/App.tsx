import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import Home from "./pages/Home/page";
import Campeonatos from "./pages/Campeonatos";

// Landing Pages (NOVAS)
import XTreinosLanding from "./pages/Xtreinos/page"; 
import ScrimsLanding from "./pages/Scrims/page"; 

// Páginas Internas
import ScrimsHub from "./pages/Scrims/hub/page"; 
import Rankings from "./pages/Rankings";

import Clans from "./pages/Clans/page";
import ClanDetail from "./components/clans/ClanDetail";
import TeamDetail from "./components/clans/TeamDetail";
import PlayerDetail from "./components/clans/PlayerDetail";

import Jogadores from "./pages/Jogadores/page";
import JogadorDetalhe from "./pages/Jogadores/[id]/page";

import Inscricoes from "./pages/Inscricoes";
import Salinhas from "./pages/Salinhas";
import Sobre from "./pages/Sobre/page";
import ExperiencePage from "./pages/Experience/page";
import SalinhaPerlotti from "./pages/salinhas/SalinhaPerlotti";

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: "#12121a", color: "#f0f0f5", border: "1px solid #2a2a3a" } }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campeonatos" element={<Campeonatos />} />

        <Route path="/xtreinos" element={<XTreinosLanding />} />
        <Route path="/scrims" element={<ScrimsLanding />} />

        <Route path="/scrims/:tab" element={<ScrimsHub />} />
        <Route path="/scrims/match/:id" element={<ScrimsHub />} />
        
        {/* Redireciona rotas antigas de Rankings de Scrims para a nova rota unificada */}
        <Route path="/rankings/scrims/:tab" element={<Navigate to="/scrims/:tab" replace />} />
        
        {/* Rankings (X-Treinos e outras tabs genéricas) */}
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/rankings/:tab" element={<Rankings />} />

        <Route path="/clans" element={<Clans />}>
          <Route path=":clanId" element={<ClanDetail />} />
          <Route path=":clanId/line/:teamId" element={<TeamDetail />} />
          <Route path=":clanId/line/:teamId/jogador/:playerId" element={<PlayerDetail />} />
        </Route>

        <Route path="/jogadores" element={<Jogadores />} />
        <Route path="/jogador/:id" element={<JogadorDetalhe />} />

        <Route path="/inscricoes" element={<Inscricoes />} />
        <Route path="/salinhas" element={<Salinhas />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/salinhas/perlotti" element={<SalinhaPerlotti />} />
      </Routes>
    </>
  );
}