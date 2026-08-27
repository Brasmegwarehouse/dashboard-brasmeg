"use client";


import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(searchParams.get("from") || "/");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen bg-navy-700 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-lg bg-white border border-navy-50 flex items-center justify-center p-1.5 mb-3">
            <Image src="/logo.png" alt="Brasmeg" width={48} height={32} className="object-contain" />
          </div>
          <h1 className="font-display font-semibold text-navy-700">Painel Gerencial</h1>
          <p className="text-xs text-slate-400 mt-0.5">Brasmeg · Armazém</p>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
          Senha de acesso
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-navy-50 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
        {error && <p className="text-xs text-red-500 mt-1.5">Senha incorreta, tente de novo.</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full mt-5 bg-brand-orange hover:bg-brand-orangeDark disabled:opacity-50 transition-colors text-white text-sm font-medium py-2.5 rounded-lg"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
