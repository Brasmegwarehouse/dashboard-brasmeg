import DataPicker from "@/components/operacional/DataPicker";
import OperacionalTabs from "@/components/operacional/OperacionalTabs";
import NovaOperacaoForm from "@/components/operacional/NovaOperacaoForm";
import OperacoesTable from "@/components/operacional/OperacoesTable";
import { getOperacoesByData } from "@/lib/operacoes-actions";

export const dynamic = "force-dynamic";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const PATH = "/controle-operacional/lancamento";

export default async function LancamentoPage({ searchParams }: { searchParams: { data?: string } }) {
  const selectedData =
    searchParams?.data && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.data) ? searchParams.data : todayISO();
  const operacoes = await getOperacoesByData(selectedData);

  return (
    <>
      <header className="static lg:sticky lg:top-0 z-10 bg-mist/90 lg:backdrop-blur border-b border-navy-50 px-6 lg:px-10 py-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-xl font-semibold text-navy-700">Lançamento de Veículos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Portaria/ADM: lança o veículo assim que atende, até o horário de liberação.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OperacionalTabs />
          <DataPicker selected={selectedData} />
        </div>
      </header>

      <main className="px-6 lg:px-10 py-8 space-y-5 max-w-6xl">
        <NovaOperacaoForm data={selectedData} path={PATH} />
        <OperacoesTable operacoes={operacoes} readOnly />
        <p className="text-xs text-slate-400">
          Essa lista é só de conferência — quem fecha a operação (início, saída e serviços adicionais) é o{" "}
          <b>Painel</b>.
        </p>
      </main>
    </>
  );
}
