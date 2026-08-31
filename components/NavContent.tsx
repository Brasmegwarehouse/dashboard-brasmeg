"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { indicators, groupOrder } from "@/lib/indicators";

// Shared nav list used by both the desktop sidebar and the mobile
// drawer, so the two never drift out of sync. `onNavigate` is called
// whenever a link is clicked — the mobile drawer uses it to close
// itself; the desktop sidebar just leaves it undefined.
export default function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-5 space-y-6">
      <div>
        <Link
          href="/"
          onClick={onNavigate}
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
                      onClick={item.ready ? onNavigate : undefined}
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
  );
}
