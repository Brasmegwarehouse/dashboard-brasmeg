import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { indicators, groupOrder } from "@/lib/indicators";
import clsx from "clsx";

export default function HomePage() {
  const readyCount = indicators.filter((i) => i.ready).length;

  return (
    <>
      <PageHeader
        title="Visão Geral"
        objective="Todos os indicadores de armazém em um só lugar — preencha uma vez em Base de Dados, cada painel se atualiza sozinho."
        year={2026}
      />

      <main className="px-6 lg:px-10 py-8 max-w-6xl space-y-8">
        <div className="bg-navy-700 rounded-xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold">Protótipo em construção</p>
            <p className="text-sm text-navy-100/80 mt-1 max-w-xl">
              {readyCount} de {indicators.length} painéis já funcionam de ponta a ponta (dados → gráfico).
              Os demais seguem o mesmo padrão e entram conforme a estrutura for validada.
            </p>
          </div>
          <Link
            href="/base-dados"
            className="shrink-0 bg-brand-orange hover:bg-brand-orangeDark transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            Preencher dados do mês →
          </Link>
        </div>

        {groupOrder.map((group) => (
          <div key={group}>
            <h2 className="font-display font-semibold text-navy-700 mb-3">{group}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {indicators
                .filter((i) => i.group === group)
                .map((item) => (
                  <Link
                    key={item.slug}
                    href={item.ready ? `/${item.slug}` : "#"}
                    aria-disabled={!item.ready}
                    className={clsx(
                      "bg-white rounded-lg border border-navy-50 shadow-card p-4 flex items-center justify-between transition-colors",
                      item.ready ? "hover:border-brand-blue/40 cursor-pointer" : "opacity-60 cursor-default"
                    )}
                  >
                    <span className="text-sm font-medium text-navy-700">{item.name}</span>
                    <span
                      className={clsx(
                        "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium",
                        item.ready ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.ready ? "Ativo" : "Em breve"}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
