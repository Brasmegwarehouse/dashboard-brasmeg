import ExportButton from "@/components/ExportButton";
import PainelClient from "@/components/operacional/PainelClient";
import OperacionalTabs from "@/components/operacional/OperacionalTabs";
import ExcelExportButton from "@/components/operacional/ExcelExportButton";
import DataPicker from "@/components/operacional/DataPicker";
import LogoutButton from "@/components/LogoutButton";
import { getOperacoesByData } from "@/lib/operacoes-actions";
import { operacoesParaLinhasExcel } from "@/lib/operacionalExport";
import { getRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const PATH = "/controle-operacional/painel";

export default async function PainelPage({ searchParams }: { searchParams: { data?: string } }) {
  const hoje = todayISO();
  const selectedData =
    searchParams?.data && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.data) ? searchParams.data : hoje;
  const isHoje = selectedData === hoje;

  const operacoes = await getOperacoesByData(selectedData);
  const role = getRole();
  const linhasExcel = operacoesParaLinhasExcel(operacoes);

  return (
    <>
      <header className="static lg:sticky lg:top-0 z-10 bg-mist/90 lg:backdrop-blur border-b border-navy-50 px-4 sm:px-6 lg:px-10 py-4 lg:py-5 flex flex-wrap items-start justify-between gap-3 print:static print:bg-white">
        <div className="max-w-2xl">
          <h1 className="font-display text-lg sm:text-xl font-semibold text-navy-700">
            Painel Operacional — Carga &amp; Descarga
          </h1>
          <p className="mt-1 text-sm text-slate-500 hidden sm:block">
            Clique num veículo lançado pra fechar a operação: horário de início, saída e serviços adicionais.
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden flex-wrap">
          {role === "geral" && <OperacionalTabs />}
          <DataPicker selected={selectedData} />
          <ExcelExportButton
            rows={linhasExcel}
            filename={`painel-${selectedData}.xlsx`}
            sheetName="Painel do Dia"
          />
          <ExportButton />
          <LogoutButton />
        </div>
      </header>

      <PainelClient operacoes={operacoes} path={PATH} isHoje={isHoje} />
    </>
  );
}
