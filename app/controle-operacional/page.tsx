import ExportButton from "@/components/ExportButton";
import DataPicker from "@/components/operacional/DataPicker";
import ControleOperacionalClient from "@/components/operacional/ControleOperacionalClient";
import { getOperacoesByData } from "@/lib/operacoes-actions";

export const dynamic = "force-dynamic";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const PATH = "/controle-operacional";

export default async function ControleOperacionalPage({
  searchParams,
}: {
  searchParams: { data?: string };
}) {
  const selectedData =
    searchParams?.data && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.data) ? searchParams.data : todayISO();

  const operacoes = await getOperacoesByData(selectedData);

  return (
    <>
      <header className="static lg:sticky lg:top-0 z-10 bg-mist/90 lg:backdrop-blur border-b border-navy-50 px-6 lg:px-10 py-5 flex flex-wrap items-start justify-between gap-4 print:static print:bg-white">
        <div className="max-w-2xl">
          <h1 className="font-display text-xl font-semibold text-navy-700">
            Controle Operacional — Carga &amp; Descarga
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-medium text-slate-600">Objetivo do indicador: </span>
            Portaria/ADM lança o veículo até a liberação; a Operação completa os horários finais e os
            serviços adicionais usados, alimentando o faturamento.
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <DataPicker selected={selectedData} />
          <ExportButton />
        </div>
      </header>

      <ControleOperacionalClient operacoes={operacoes} data={selectedData} path={PATH} />
    </>
  );
}
