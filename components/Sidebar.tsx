"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { indicators, groupOrder } from "@/lib/indicators";

export default function Sidebar() {
  const pathname = usePathname();

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

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-5 space-y-6">
        <div>
          <Link
            href="/"
            className={clsx(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative font-medium",
              pathname === "/" ? "bg-white/10 text-white" : "text-navy-100/85 hover:bg-white/5 hover:text-white"
            )}
          >
            {pathname === "/" && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-orange" />}
            <span>Visão Geral</span>
          </Link>
        </div>

        {groupOrder.map((group) => (
          <div key={group}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-navy-100/50 mb-2">
              {group}
            </p>
            <ul className="space-y-0.5">
              {indicators
                .filter((i) => i.group === group)
                .map((item) => {
                  const href = `/${item.slug}`;
                  const active = pathname === href;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={item.ready ? href : "#"}
                        aria-disabled={!item.ready}
                        className={clsx(
                          "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative",
                          active
                            ? "bg-white/10 text-white font-medium"
                            : item.ready
                            ? "text-navy-100/85 hover:bg-white/5 hover:text-white"
                            : "text-navy-100/35 cursor-default"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-orange" />
                        )}
                        <span className="truncate">{item.name}</span>
                        {!item.ready && (
                          <span className="ml-auto text-[10px] uppercase tracking-wide bg-white/5 px-1.5 py-0.5 rounded">
                            em breve
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/10 text-[11px] text-navy-100/50">
        Protótipo · dados 2026
      </div>
    </aside>
  );
}
