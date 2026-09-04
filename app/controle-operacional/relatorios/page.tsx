import OperacionalHeader from "@/components/operacional/OperacionalHeader";
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
      <OperacionalHeader
        title="Relatórios — Carga, Descarga & Entrega"
        subtitle="Volume por dia, por tipo de operação e melhores clientes no mês selecionado."
        actions={
          <>
            <OperacionalTabs />
            <MesPicker selected={mes} />
            <ExcelExportButton rows={linhasExcel} filename={`operacoes-${mes}.xlsx`} sheetName="Mês" />
          </>
        }
      />

      <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-6xl">
        <RelatoriosCharts resumo={resumo} />
      </main>
    </>
  );
}
