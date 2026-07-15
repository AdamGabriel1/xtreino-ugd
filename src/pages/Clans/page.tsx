import { trpc } from "@/providers/trpc";
import MainLayout from "@/components/layout/MainLayout";
import ClanList from "@/components/clans/ClanList";
import { Outlet } from "react-router"; // Importante para rotas aninhadas

export default function Clans() {
  const { data: clansList, isLoading: clansLoading } = trpc.clans.list.useQuery();

  return (
    <MainLayout>
      {/* O Outlet renderiza o ClanDetail, TeamDetail ou PlayerDetail 
          dependendo da URL atual. Se for só /clans, ele não renderiza nada */}
      <Outlet />
      
      {/* A lista só é exibida se não houver um ID de clã na URL */}
      {!window.location.pathname.includes("/clans/") && (
        <ClanList 
          clans={clansList ?? []} 
          isLoading={clansLoading} 
          onClanClick={(id) => window.location.href = `/clans/${id}`} 
        />
      )}
    </MainLayout>
  );
}