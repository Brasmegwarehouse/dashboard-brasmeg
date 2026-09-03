import MesPicker from "@/components/operacional/MesPicker";
import OperacionalTabs from "@/components/operacional/OperacionalTabs";
import RelatoriosCharts from "@/components/operacional/RelatoriosCharts";
import ExcelExportButton from "@/components/operacional/ExcelExportButton";
import { getResumoMensal, getOperacoesByMes } from "@/lib/operacoes-actions";
import { operacoesParaLinhasExcel } from "@/lib/operacionalExport";

export const dynamic = "force-dynamic";

function currentMonthISO() {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export default async function RelatoriosPage({ searchParams }: { searchParams: { mes?: string } }) {
  const mes = searchParams?.mes && /^\d{4}-\d{2}$/.test(searchParams.mes) ? searchParams.mes : currentMonthISO();
  const [resumo, operacoesDoMes] = await Promise.all([getResumoMensal(mes), getOperacoesByMes(mes)]);
  const linhasExcel = operacoesParaLinhasExcel(operacoesDoMes);

  return (
    <>
      <header className="static lg:sticky lg:top-0 z-10 bg-mist/90 lg:backdrop-blur border-b border-navy-50 px-6 lg:px-10 py-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-xl font-semibold text-navy-700">Relatórios — Carga, Descarga & Entrega</h1>
          <p className="mt-1 text-sm text-slate-500">
            Volume por dia, por tipo de operação e melhores clientes no mês selecionado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OperacionalTabs />
          <MesPicker selected={mes} />
          <ExcelExportButton rows={linhasExcel} filename={`operacoes-${mes}.xlsx`} sheetName="Mês" />
        </div>
      </header>

      <main className="px-6 lg:px-10 py-8 max-w-6xl">
        <RelatoriosCharts resumo={resumo} />
      </main>
    </>
  );
}
