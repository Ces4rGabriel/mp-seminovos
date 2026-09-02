import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Compre e Financie Carros Seminovos | MP Seminovos",
    template: "%s | MP Seminovos",
  },
  description: "Compre carros seminovos com qualidade, procedência e as melhores condições de financiamento na MP Seminovos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
