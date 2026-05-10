import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Dashboard",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/todos", label: "Todos" },
  { href: "/calendar", label: "Calendar" },
  { href: "/food", label: "Food" },
  { href: "/health", label: "Health" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans bg-zinc-50 dark:bg-black`}>
        <div className="flex min-h-screen">
          <nav className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {label}
              </Link>
            ))}
          </nav>
          <main className="flex-1 p-8">
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
