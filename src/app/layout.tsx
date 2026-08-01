import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aram",
    template: "%s · Aram",
  },
  description: "Biblioteca de demostraciones matemáticas escritas en LaTeX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-6 w-auto overflow-visible" />
              <span className="text-sm tracking-[0.2em] uppercase">Aram</span>
            </Link>
            {/* El editor no aparece aqui a proposito: es una herramienta
                local, no forma parte del sitio publicado. */}
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/materias" className="text-muted hover:text-foreground">
                Materias
              </Link>
              <ThemeToggle />
            </nav>
          </header>

          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
