"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function MesPicker({ selected }: { selected: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-navy-50 rounded-lg px-3 py-1.5 shadow-card">
      <span className="text-xs text-slate-400">Mês</span>
      <input
        type="month"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="font-display font-semibold text-navy-700 text-sm bg-transparent focus:outline-none"
      />
    </div>
  );
}
