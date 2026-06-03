import { trpc } from "@/providers/trpc";
import { Link } from "react-router";

export default function Footer() {
  const { data: settings } = trpc.settings.get.useQuery();

  return (
    <footer className="bg-[#12121a] border-t border-[#2a2a3a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img
                src="/logo-xtreino.jpg"
                alt="XTreinos Logo"
                className="w-9 h-9 rounded-lg object-cover"
                draggable={false}
              />
              <span className="font-bold text-lg text-[#f0f0f5] hidden sm:block">
                {settings?.orgName ?? "XTreinos"}
              </span>
            </Link>
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