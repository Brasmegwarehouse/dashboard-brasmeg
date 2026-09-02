import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { getRole } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Painel Gerencial · Brasmeg",
  description: "Dashboard de indicadores de armazém — Brasmeg Transporte e Armazém Geral",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Login "operacional" só acessa o painel — sem menu lateral com os
  // outros indicadores, fica só a tela limpa em largura total.
  const role = getRole();
  const showChrome = role !== "operacional";

  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        {showChrome && <Sidebar />}
        <div className={showChrome ? "lg:pl-72" : ""}>
          {showChrome && <MobileNav />}
          {children}
        </div>
      </body>
    </html>
  );
}
