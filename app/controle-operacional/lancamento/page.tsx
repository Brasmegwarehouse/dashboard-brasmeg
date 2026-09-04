import OperacionalHeader from "@/components/operacional/OperacionalHeader";
import DataPicker from "@/components/operacional/DataPicker";
import OperacionalTabs from "@/components/operacional/OperacionalTabs";
import LancamentoClient from "@/components/operacional/LancamentoClient";
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
      <OperacionalHeader
        title="Lançamento de Veículos"
        subtitle="Portaria/ADM: lança o veículo até a liberação. Todos os campos são obrigatórios."
        actions={
          <>
            <OperacionalTabs />
            <DataPicker selected={selectedData} />
          </>
        }
      />

      <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-6xl">
        <LancamentoClient operacoes={operacoes} data={selectedData} path={PATH} />
      </main>
    </>
  );
}
