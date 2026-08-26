interface PageHeaderProps {
  title: string;
  objective?: string;
  year: number;
}

export default function PageHeader({ title, objective, year }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-mist/90 backdrop-blur border-b border-navy-50 px-6 lg:px-10 py-5 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="font-display text-xl font-semibold text-navy-700">{title}</h1>
        {objective && (
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-medium text-slate-600">Objetivo do indicador: </span>
            {objective}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 bg-white border border-navy-50 rounded-lg px-3 py-1.5 shadow-card">
        <span className="text-xs text-slate-400">Ano</span>
        <span className="font-display font-semibold text-navy-700">{year}</span>
      </div>
    </header>
  );
}
