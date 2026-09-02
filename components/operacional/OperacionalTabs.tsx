"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { href: "/controle-operacional/painel", label: "Painel" },
  { href: "/controle-operacional/lancamento", label: "Lançar veículo" },
  { href: "/controle-operacional/faturamento", label: "Faturamento" },
  { href: "/controle-operacional/relatorios", label: "Relatórios" },
];

export default function OperacionalTabs() {
  const pathname = usePathname();

  return (
    <div className="inline-flex bg-white border border-navy-50 rounded-lg p-1 shadow-card">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              "px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors",
              active ? "bg-brand-blue text-white" : "text-slate-500 hover:text-navy-700"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
