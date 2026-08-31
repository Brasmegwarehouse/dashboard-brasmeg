"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import NavContent from "@/components/NavContent";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock background scroll while the drawer is open, and let Esc close it —
  // small touches that make it feel like a native app sheet rather than
  // a webpage overlay.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 bg-navy-700 text-white flex items-center gap-3 px-4 h-14 print:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="p-1.5 -ml-1.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center p-1 shrink-0">
          <Image src="/logo.png" alt="Brasmeg" width={28} height={19} className="object-contain" />
        </div>
        <div className="leading-tight">
          <p className="font-display font-semibold text-xs tracking-wide">BRASMEG</p>
          <p className="text-[10px] text-navy-100/70 -mt-0.5">Painel Gerencial</p>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop — tap outside the drawer to close */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="relative w-72 max-w-[85vw] h-full bg-navy-700 text-white flex flex-col shadow-xl animate-drawer-in">
            <div className="flex items-center justify-between gap-3 px-6 h-20 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-md bg-white flex items-center justify-center p-1 shrink-0">
                  <Image src="/logo.png" alt="Brasmeg" width={40} height={27} className="object-contain" />
                </div>
                <div className="leading-tight">
                  <p className="font-display font-semibold text-sm tracking-wide">BRASMEG</p>
                  <p className="text-[11px] text-navy-100/70 -mt-0.5">Painel Gerencial · Armazém</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <NavContent onNavigate={() => setOpen(false)} />

            <div className="px-6 py-4 border-t border-white/10 text-[11px] text-navy-100/50">
              Protótipo · dados 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
}
