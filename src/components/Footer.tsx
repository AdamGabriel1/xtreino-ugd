import { Gamepad2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Footer() {
  const { data: settings } = trpc.settings.get.useQuery();

  return (
    <footer className="bg-[#12121a] border-t border-[#2a2a3a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[#f0f0f5] font-semibold text-sm">
                {settings?.orgName ?? "XTreinos Mobile"}
              </p>
              <p className="text-[#5a5a6e] text-xs">Todos os direitos reservados</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {settings?.discordLink && (
              <a
                href={settings.discordLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8a8a9e] hover:text-[#5865F2] transition-colors"
              >
                Discord
              </a>
            )}
            {settings?.whatsappLink && (
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8a8a9e] hover:text-[#25D366] transition-colors"
              >
                WhatsApp
              </a>
            )}
          </div>

          <p className="text-[#5a5a6e] text-xs">Powered by XTreinos Mobile</p>
        </div>
      </div>
    </footer>
  );
}
