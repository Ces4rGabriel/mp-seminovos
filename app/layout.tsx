import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-outfit" });

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
      <body className={`${inter.className} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
