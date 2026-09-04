import Image from "next/image";
import type { ReactNode } from "react";

export default function OperacionalHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions: ReactNode;
}) {
  return (
    <div className="static lg:sticky lg:top-0 z-10 print:static">
      {/* Faixa de marca — logo em destaque, azul-marinho + friso laranja da Brasmeg. */}
      <div className="bg-navy-700 text-white print:bg-white print:text-navy-700">
        <div className="h-1 bg-brand-orange print:hidden" />
        <div className="px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4 flex items-center gap-3.5">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-white flex items-center justify-center p-1.5 shrink-0 shadow-card">
            <Image src="/logo.png" alt="Brasmeg" width={40} height={27} className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-orange font-semibold">
              Brasmeg · Transporte e Armazém Geral
            </p>
            <h1 className="font-display text-base sm:text-xl font-semibold leading-tight truncate">{title}</h1>
          </div>
        </div>
      </div>

      {/* Barra de ações — mais neutra, pra não pesar ao lado dos botões. */}
      <div className="bg-mist/95 lg:backdrop-blur border-b border-navy-50 px-4 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
        {subtitle ? <p className="text-sm text-slate-500 hidden sm:block">{subtitle}</p> : <span />}
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      </div>
    </div>
  );
}
