import Image from "next/image";
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
      <div className="static lg:sticky lg:top-0 z-10 print:static">
        {/* Faixa de marca — logo em destaque, pensada pra quem só vê essa
            tela (login operacional não tem menu lateral nenhum). */}
        <div className="bg-navy-700 text-white print:bg-white print:text-navy-700">
          <div className="h-1 bg-brand-orange print:hidden" />
          <div className="px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4 flex items-center gap-3.5">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-white flex items-center justify-center p-1.5 shrink-0 shadow-card">
              <Image src="/logo.png" alt="Brasmeg" width={40} height={27} className="object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-orange print:text-brand-orange font-semibold">
                Brasmeg · Transporte e Armazém Geral
              </p>
              <h1 className="font-display text-base sm:text-xl font-semibold leading-tight truncate">
                Painel Operacional — Carga &amp; Descarga
              </h1>
            </div>
          </div>
        </div>

        {/* Barra de ações — data, exportações e navegação, num tom mais neutro */}
        <div className="bg-mist/95 lg:backdrop-blur border-b border-navy-50 px-4 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="text-sm text-slate-500 hidden sm:block">
            Clique num veículo lançado pra fechar a operação.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
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
        </div>
      </div>

      <PainelClient operacoes={operacoes} path={PATH} isHoje={isHoje} />
    </>
  );
}
