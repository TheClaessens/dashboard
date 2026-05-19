import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import "@/styles/globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${jakartaSans.variable} ${geistMono.variable}`}>
      <body>
        <div style={{ display: "flex", minHeight: "100dvh" }}>
          <Providers>
            <Sidebar />
            <main style={{ flex: 1, minWidth: 0, padding: "var(--pad-8)", overflowY: "auto" }}>
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
