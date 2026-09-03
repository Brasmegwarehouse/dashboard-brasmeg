"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  if (variant === "dark") {
    return (
      <button
        onClick={handleLogout}
        disabled={pending}
        className="flex items-center gap-2 text-[13px] text-navy-100/70 hover:text-white transition-colors disabled:opacity-50"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {pending ? "Saindo…" : "Sair"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="flex items-center gap-1.5 bg-white border border-navy-50 rounded-lg px-3 py-1.5 shadow-card text-sm font-medium text-navy-700 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50 print:hidden"
      title="Sair"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
