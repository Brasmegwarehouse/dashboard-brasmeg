"use client";

import * as XLSX from "xlsx";

export default function ExcelExportButton({
  rows,
  filename,
  sheetName = "Dados",
}: {
  rows: Record<string, string | number>[];
  filename: string;
  sheetName?: string;
}) {
  const disabled = rows.length === 0;

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      title={disabled ? "Nada pra exportar ainda" : "Baixar como planilha Excel"}
      className="flex items-center gap-1.5 bg-white border border-navy-50 rounded-lg px-3 py-1.5 shadow-card text-sm font-medium text-navy-700 hover:border-brand-blue/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15h6M9 12h6M9 18h3" />
      </svg>
      Exportar Excel
    </button>
  );
}
