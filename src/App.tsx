import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Campeonatos from "./pages/Campeonatos";
import XTreinos from "./pages/XTreinos";
import Scrims from "./pages/Scrims/page";
import Rankings from "./pages/Rankings";
import Clans from "./pages/Clans";
import Jogadores from "./pages/Jogadores";
import Inscricoes from "./pages/Inscricoes";
import Salinhas from "./pages/Salinhas";
import Sobre from "./pages/Sobre";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminClans from "./pages/admin/Clans";
import AdminJogadores from "./pages/admin/Jogadores";
import AdminCampeonatos from "./pages/admin/Campeonatos";
import AdminXTreinos from "./pages/admin/XTreinos";
import AdminScrims from "./pages/admin/Scrims";
import AdminRankings from "./pages/admin/Rankings";
import AdminConfiguracoes from "./pages/admin/Configuracoes";

import SalinhaPerlotti from "./pages/salinhas/SalinhaPerlotti";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#12121a",
            color: "#f0f0f5",
            border: "1px solid #2a2a3a",
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/campeonatos" element={<Campeonatos />} />
        <Route path="/xtreinos" element={<XTreinos />} />
        <Route path="/scrims" element={<Scrims />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/clans" element={<Clans />} />
        <Route path="/jogadores" element={<Jogadores />} />
        <Route path="/inscricoes" element={<Inscricoes />} />
        <Route path="/salinhas" element={<Salinhas />} />
        <Route path="/sobre" element={<Sobre />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/clans" element={<AdminClans />} />
        <Route path="/admin/jogadores" element={<AdminJogadores />} />
        <Route path="/admin/campeonatos" element={<AdminCampeonatos />} />
        <Route path="/admin/xtreinos" element={<AdminXTreinos />} />
        <Route path="/admin/scrims" element={<AdminScrims />} />
        <Route path="/admin/rankings" element={<AdminRankings />} />
        <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />

        {/* Salinha Routes */}
        <Route path="/salinhas/perlotti" element={<SalinhaPerlotti />} />
      </Routes>
    </>
  );
}
