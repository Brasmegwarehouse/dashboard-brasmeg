import ExportButton from "@/components/ExportButton";
import YearPicker from "@/components/YearPicker";

interface PageHeaderProps {
  title: string;
  objective?: string;
  year: number;
}

export default function PageHeader({ title, objective, year }: PageHeaderProps) {
  return (
    <header className="static lg:sticky lg:top-0 z-10 bg-mist/90 lg:backdrop-blur border-b border-navy-50 px-6 lg:px-10 py-5 flex flex-wrap items-start justify-between gap-4 print:static print:bg-white">
      <div className="max-w-2xl">
        <h1 className="font-display text-xl font-semibold text-navy-700">{title}</h1>
        {objective && (
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-medium text-slate-600">Objetivo do indicador: </span>
            {objective}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 print:hidden">
        <YearPicker selected={year} />
        <ExportButton />
      </div>
    </header>
  );
}
