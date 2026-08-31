import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Painel Gerencial · Brasmeg",
  description: "Dashboard de indicadores de armazém — Brasmeg Transporte e Armazém Geral",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        <Sidebar />
        <div className="lg:pl-72">
          <MobileNav />
          {children}
        </div>
      </body>
    </html>
  );
}
