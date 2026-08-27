import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import { indicators, groupOrder, months } from "@/lib/indicators";
import { getMetricsForYear } from "@/lib/actions";
import clsx from "clsx";

export const dynamic = "force-dynamic";

const YEAR = 2026;

function lastValue(rows: Awaited<ReturnType<typeof getMetricsForYear>>, metricKey: string) {
  const filled = rows
    .filter((r) => r.metricKey === metricKey && r.value !== null)
    .sort((a, b) => b.month - a.month);
  if (!filled.length) return { value: null as number | null, month: null as number | null };
  return { value: Number(filled[0].value), month: filled[0].month };
}

export default async function HomePage() {
  const readyCount = indicators.filter((i) => i.ready).length;

  const [recExp, ocupPP, ocupBL, acuracidade, faturamento] = await Promise.all([
    getMetricsForYear("recebimento_expedicao", YEAR),
    getMetricsForYear("ocupacao_pp", YEAR),
    getMetricsForYear("ocupacao_bl", YEAR),
    getMetricsForYear("acuracidade_estoque", YEAR),
    getMetricsForYear("faturamento_vs_orcado", YEAR),
  ]);

  const recebidas = lastValue(recExp, "nfs_recebidas");
  const expedidas = lastValue(recExp, "nfs_expedidas");
  const pp = lastValue(ocupPP, "ocupadas_pct");
  const bl = lastValue(ocupBL, "ocupadas_pct");

  const apuradas = lastValue(acuracidade, "posicoes_apuradas");
  const faltas = lastValue(acuracidade, "faltas");
  const acuracidadePct =
    apuradas.value !== null && faltas.value !== null && apuradas.month === faltas.month && apuradas.value !== 0
      ? ((apuradas.value - faltas.value) / apuradas.value) * 100
      : null;

  const fat = lastValue(faturamento, "faturamento");
  const orc = lastValue(faturamento, "orcado");
  const fatPct =
    fat.value !== null && orc.value !== null && fat.month === orc.month && orc.value !== 0 ? (fat.value / orc.value) * 100 : null;

  const monthLabel = (m: number | null) => (m ? months[m - 1] : "—");

  return (
    <>
      <PageHeader
        title="Visão Geral"
        objective="Todos os indicadores de armazém em um só lugar — preencha uma vez em Base de Dados, cada painel se atualiza sozinho."
        year={YEAR}
      />

      <main className="px-6 lg:px-10 py-8 max-w-6xl space-y-8">
        <div className="bg-navy-700 rounded-xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold">Painel completo</p>
            <p className="text-sm text-navy-100/80 mt-1 max-w-xl">
              {readyCount} de {indicators.length} painéis já funcionam de ponta a ponta (dados → gráfico).
            </p>
          </div>
          <Link
            href="/base-dados"
            className="shrink-0 bg-brand-orange hover:bg-brand-orangeDark transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            Preencher dados do mês →
          </Link>
        </div>

        <div>
          <h2 className="font-display font-semibold text-navy-700 mb-3">Resumo do mês mais recente</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard
              label="Recebimento"
              value={recebidas.value !== null ? String(recebidas.value) : "—"}
              hint={recebidas.month ? `NF's — ${monthLabel(recebidas.month)}` : "Sem dados ainda"}
            />
            <KpiCard
              label="Expedição"
              value={expedidas.value !== null ? String(expedidas.value) : "—"}
              hint={expedidas.month ? `NF's — ${monthLabel(expedidas.month)}` : "Sem dados ainda"}
            />
            <KpiCard
              label="Ocupação PP"
              value={pp.value !== null ? `${pp.value.toFixed(1)}%` : "—"}
              hint={pp.month ? monthLabel(pp.month) : "Sem dados ainda"}
            />
            <KpiCard
              label="Ocupação BL"
              value={bl.value !== null ? `${bl.value.toFixed(1)}%` : "—"}
              hint={bl.month ? monthLabel(bl.month) : "Sem dados ainda"}
            />
            <KpiCard
              label="Acuracidade de Estoque"
              value={acuracidadePct !== null ? `${acuracidadePct.toFixed(1)}%` : "—"}
              hint={apuradas.month ? monthLabel(apuradas.month) : "Sem dados ainda"}
            />
            <KpiCard
              label="Faturamento vs Orçado"
              value={fatPct !== null ? `${fatPct.toFixed(0)}%` : "—"}
              hint={fat.month ? `Atingido — ${monthLabel(fat.month)}` : "Sem dados ainda"}
            />
          </div>
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
