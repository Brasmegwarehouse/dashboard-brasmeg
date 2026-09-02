import DataPicker from "@/components/operacional/DataPicker";
import OperacionalTabs from "@/components/operacional/OperacionalTabs";
import FaturamentoView from "@/components/operacional/FaturamentoView";
import { getOperacoesByData } from "@/lib/operacoes-actions";

export const dynamic = "force-dynamic";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function FaturamentoPage({ searchParams }: { searchParams: { data?: string } }) {
  const selectedData =
    searchParams?.data && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.data) ? searchParams.data : todayISO();
  const operacoes = await getOperacoesByData(selectedData);

  return (
    <>
      <header className="static lg:sticky lg:top-0 z-10 bg-mist/90 lg:backdrop-blur border-b border-navy-50 px-6 lg:px-10 py-5 flex flex-wrap items-start justify-between gap-4 print:static print:bg-white">
        <div className="max-w-2xl">
          <h1 className="font-display text-xl font-semibold text-navy-700">Faturamento — Serviços Adicionais</h1>
          <p className="mt-1 text-sm text-slate-500">
            Notas com serviço adicional lançado nesta data, prontas pra virar cobrança.
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <OperacionalTabs />
          <DataPicker selected={selectedData} />
        </div>
      </header>

      <main className="px-6 lg:px-10 py-8 max-w-6xl">
        <FaturamentoView operacoes={operacoes} />
      </main>
    </>
  );
}
