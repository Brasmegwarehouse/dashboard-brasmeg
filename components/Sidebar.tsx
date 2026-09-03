import Image from "next/image";
import NavContent from "@/components/NavContent";
import LogoutButton from "@/components/LogoutButton";

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-navy-700 text-white">
      <div className="flex items-center gap-3 px-6 h-20 border-b border-white/10">
        {/* Logo has a transparent background but light-colored text/strokes
            that read poorly on navy — a small white card keeps it legible
            without fighting the sidebar's dark theme. */}
        <div className="h-11 w-11 rounded-md bg-white flex items-center justify-center p-1 shrink-0">
          <Image src="/logo.png" alt="Brasmeg" width={40} height={27} className="object-contain" />
        </div>
        <div className="leading-tight">
          <p className="font-display font-semibold text-sm tracking-wide">BRASMEG</p>
          <p className="text-[11px] text-navy-100/70 -mt-0.5">Painel Gerencial · Armazém</p>
        </div>
      </div>

      <NavContent />

      <div className="px-6 py-4 border-t border-white/10 space-y-3">
        <LogoutButton variant="dark" />
        <p className="text-[11px] text-navy-100/50">Protótipo · dados 2026</p>
      </div>
    </aside>
  );
}
