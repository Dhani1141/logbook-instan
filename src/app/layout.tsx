import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Logbook PKL - Teknik Informatika UMKT",
  description:
    "Generator Logbook PKL otomatis untuk mahasiswa Teknik Informatika Universitas Muhammadiyah Kalimantan Timur.",
  keywords: ["logbook", "PKL", "UMKT", "Teknik Informatika", "Praktek Kerja Lapangan"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
