import MainLayout from "@/layout/MainLayout";
import XTreinosTab from "./components/XTreinosTab";

export default function XTreinos() {
  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="bg-[#0d1a0d] border-b border-[#1a3a1a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏋️</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#e0f0e0]">
              XTreinos Underground
            </h1>
          </div>
          <p className="text-[#6a8e6a]">
            Classificação completa — Pontos por posição + Pontos por kill
          </p>
        </div>

        <div className="py-8">
          <XTreinosTab />
        </div>
      </div>
    </MainLayout>
  );
}