import OperacionalHeader from "@/components/operacional/OperacionalHeader";
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
      <OperacionalHeader
        title="Faturamento — Serviços Adicionais"
        subtitle="Notas com serviço adicional lançado nesta data, prontas pra virar cobrança."
        actions={
          <>
            <OperacionalTabs />
            <DataPicker selected={selectedData} />
          </>
        }
      />

      <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-6xl">
        <FaturamentoView operacoes={operacoes} />
      </main>
    </>
  );
}
