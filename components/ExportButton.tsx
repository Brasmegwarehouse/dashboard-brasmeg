"use client";

export default function ExportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 bg-white border border-navy-50 rounded-lg px-3 py-1.5 shadow-card text-sm font-medium text-navy-700 hover:border-brand-blue/40 transition-colors print:hidden"
      title="Exportar como PDF ou imprimir"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Exportar
    </button>
  );
}
