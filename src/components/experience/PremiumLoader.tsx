import MainLayout from "@/components/layout/MainLayout";

export function PremiumLoader() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-6 animate-pulse">
            <div className="h-4 w-48 bg-[#12121a] rounded-full mx-auto" />
            <div className="h-20 w-[80vw] max-w-3xl bg-[#12121a] rounded-xl mx-auto" />
            <div className="h-4 w-64 bg-[#12121a] rounded-full mx-auto" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#12121a] rounded-2xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}