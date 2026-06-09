import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reinigung Manager",
  description: "Betriebssoftware für Reinigungsfirmen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className={`${geist.className} bg-gray-50 h-full`}>
        <div className="flex h-full overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
