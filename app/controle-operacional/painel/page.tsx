import OperacionalHeader from "@/components/operacional/OperacionalHeader";
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
      <OperacionalHeader
        title="Painel Operacional — Carga & Descarga"
        subtitle="Clique num veículo lançado pra fechar a operação."
        actions={
          <>
            {role === "geral" && <OperacionalTabs />}
            <DataPicker selected={selectedData} />
            <ExcelExportButton
              rows={linhasExcel}
              filename={`painel-${selectedData}.xlsx`}
              sheetName="Painel do Dia"
            />
            <ExportButton />
            <LogoutButton />
          </>
        }
      />

      <PainelClient operacoes={operacoes} path={PATH} isHoje={isHoje} />
    </>
  );
}
